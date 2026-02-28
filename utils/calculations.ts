import { Session, SessionSet, DailyStats, WeeklyStats, PersonalRecord } from '../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';

export const calculateDailyVolume = (sets: SessionSet[]): number => {
  return sets.reduce((total, set) => total + set.value, 0);
};

export const calculateIbadahVolume = (sets: SessionSet[], ibadahTypeId: string): number => {
  return sets
    .filter((set) => set.ibadahTypeId === ibadahTypeId)
    .reduce((total, set) => total + set.value, 0);
};

export const calculateDailyStats = (
  session: Session,
  sets: SessionSet[],
  ibadahTypes: { id: string; name: string }[]
): DailyStats => {
  const ibadahBreakdown = ibadahTypes
    .map((type) => {
      const typeSets = sets.filter((s) => s.ibadahTypeId === type.id);
      return {
        ibadahTypeId: type.id,
        ibadahName: type.name,
        totalValue: typeSets.reduce((sum, s) => sum + s.value, 0),
        setCount: typeSets.length,
      };
    })
    .filter((breakdown) => breakdown.setCount > 0);

  return {
    date: session.sessionDate,
    totalVolume: sets.reduce((sum, s) => sum + s.value, 0),
    setCount: sets.length,
    ibadahBreakdown,
  };
};

export const calculateWeeklyStats = (
  sessions: Session[],
  allSets: SessionSet[],
  weekStartDate: Date,
  ibadahTypes?: { id: string; name: string }[]
): WeeklyStats => {
  const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  const weekSessions = sessions.filter(
    (s) => s.sessionDate >= weekStartStr && s.sessionDate <= weekEndStr
  );

  const dailyStats: DailyStats[] = daysInWeek.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const session = weekSessions.find((s) => s.sessionDate === dateStr);

    if (!session) {
      return {
        date: dateStr,
        totalVolume: 0,
        setCount: 0,
        ibadahBreakdown: [],
      };
    }

    const sessionSets = allSets.filter((s) => s.sessionId === session.id);

    const ibadahBreakdown = ibadahTypes
      ? ibadahTypes
          .map((type) => {
            const typeSets = sessionSets.filter((s) => s.ibadahTypeId === type.id);
            return {
              ibadahTypeId: type.id,
              ibadahName: type.name,
              totalValue: typeSets.reduce((sum, s) => sum + s.value, 0),
              setCount: typeSets.length,
            };
          })
          .filter((breakdown) => breakdown.setCount > 0)
      : [];

    return {
      date: dateStr,
      totalVolume: sessionSets.reduce((sum, s) => sum + s.value, 0),
      setCount: sessionSets.length,
      ibadahBreakdown,
    };
  });

  const totalVolume = dailyStats.reduce((sum, d) => sum + d.totalVolume, 0);
  const activeDays = dailyStats.filter((d) => d.totalVolume > 0).length;

  return {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    totalVolume,
    averageDailyVolume: activeDays > 0 ? totalVolume / activeDays : 0,
    activeDays,
    dailyStats,
  };
};

export const calculateStreak = (sessions: Session[]): number => {
  if (sessions.length === 0) return 0;

  const sortedSessions = [...sessions].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));

  const today = format(new Date(), 'yyyy-MM-dd');
  let streak = 0;
  let currentDate = today;

  for (const session of sortedSessions) {
    if (session.sessionDate === currentDate) {
      streak++;
      const prevDate = new Date(parseISO(currentDate));
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = format(prevDate, 'yyyy-MM-dd');
    } else if (session.sessionDate < currentDate) {
      break;
    }
  }

  return streak;
};

export const findPersonalRecords = (
  sessions: Session[],
  allSets: SessionSet[]
): PersonalRecord[] => {
  const records: PersonalRecord[] = [];
  const ibadahBests: Map<string, { value: number; date: string }> = new Map();
  const dailyBests: Map<string, { value: number; date: string }> = new Map();

  sessions.forEach((session) => {
    const sessionSets = allSets.filter((s) => s.sessionId === session.id);

    const ibadahTotals: Map<string, number> = new Map();
    sessionSets.forEach((set) => {
      const current = ibadahTotals.get(set.ibadahTypeId) || 0;
      ibadahTotals.set(set.ibadahTypeId, current + set.value);

      const existingSetBest = ibadahBests.get(`set_${set.ibadahTypeId}`);
      if (!existingSetBest || set.value > existingSetBest.value) {
        ibadahBests.set(`set_${set.ibadahTypeId}`, {
          value: set.value,
          date: session.sessionDate,
        });
      }
    });

    ibadahTotals.forEach((total, ibadahTypeId) => {
      const existing = dailyBests.get(ibadahTypeId);
      if (!existing || total > existing.value) {
        dailyBests.set(ibadahTypeId, {
          value: total,
          date: session.sessionDate,
        });
      }
    });
  });

  dailyBests.forEach((data, ibadahTypeId) => {
    records.push({
      id: `pr_daily_${ibadahTypeId}`,
      ibadahTypeId,
      recordType: 'daily_volume',
      value: data.value,
      achievedDate: data.date,
      createdAt: new Date(),
    });
  });

  ibadahBests.forEach((data, key) => {
    if (key.startsWith('set_')) {
      const ibadahTypeId = key.replace('set_', '');
      records.push({
        id: `pr_set_${ibadahTypeId}`,
        ibadahTypeId,
        recordType: 'single_set',
        value: data.value,
        achievedDate: data.date,
        createdAt: new Date(),
      });
    }
  });

  return records;
};

export const getAverageVolume = (
  sessions: Session[],
  allSets: SessionSet[],
  days: number
): number => {
  if (sessions.length === 0) return 0;

  const recentSessions = sessions.slice(0, days);
  const totalVolume = recentSessions.reduce((sum, session) => {
    const sessionSets = allSets.filter((s) => s.sessionId === session.id);
    return sum + sessionSets.reduce((setSum, s) => setSum + s.value, 0);
  }, 0);

  return totalVolume / recentSessions.length;
};

export const formatVolume = (value: number, unit: string): string => {
  if (unit === 'currency') {
    return `$${value.toFixed(2)}`;
  }

  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};
