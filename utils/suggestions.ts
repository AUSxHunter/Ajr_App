import { Session, SessionSet, OverloadSuggestion, IbadahType } from '../types';
import {
  CONSISTENCY_THRESHOLD,
  OVERLOAD_INCREASE_MIN,
  OVERLOAD_INCREASE_MAX,
} from '../constants/defaults';
import { subDays, format } from 'date-fns';

interface SessionData {
  sessions: Session[];
  sessionSets: SessionSet[];
  ibadahTypes: IbadahType[];
}

export const calculateConsistency = (sessions: Session[], days: number): number => {
  const today = new Date();
  const dates: Set<string> = new Set();

  for (let i = 0; i < days; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const hasSession = sessions.some((s) => s.sessionDate === date);
    if (hasSession) {
      dates.add(date);
    }
  }

  return dates.size / days;
};

export const getIbadahAverages = (
  sessions: Session[],
  sessionSets: SessionSet[],
  ibadahTypeId: string,
  days: number
): { average: number; trend: 'increasing' | 'stable' | 'decreasing' } => {
  const today = new Date();
  const recentDates: string[] = [];

  for (let i = 0; i < days; i++) {
    recentDates.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }

  const recentSessions = sessions.filter((s) => recentDates.includes(s.sessionDate));

  const dailyTotals: number[] = recentDates.map((date) => {
    const session = recentSessions.find((s) => s.sessionDate === date);
    if (!session) return 0;

    const sets = sessionSets.filter(
      (s) => s.sessionId === session.id && s.ibadahTypeId === ibadahTypeId
    );
    return sets.reduce((sum, s) => sum + s.value, 0);
  });

  const activeDays = dailyTotals.filter((t) => t > 0);
  const average =
    activeDays.length > 0 ? activeDays.reduce((sum, t) => sum + t, 0) / activeDays.length : 0;

  const halfPoint = Math.floor(days / 2);
  const firstHalf = dailyTotals.slice(halfPoint);
  const secondHalf = dailyTotals.slice(0, halfPoint);

  const firstHalfAvg =
    firstHalf.filter((t) => t > 0).reduce((sum, t) => sum + t, 0) /
    Math.max(1, firstHalf.filter((t) => t > 0).length);
  const secondHalfAvg =
    secondHalf.filter((t) => t > 0).reduce((sum, t) => sum + t, 0) /
    Math.max(1, secondHalf.filter((t) => t > 0).length);

  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (secondHalfAvg > firstHalfAvg * 1.1) {
    trend = 'increasing';
  } else if (secondHalfAvg < firstHalfAvg * 0.9) {
    trend = 'decreasing';
  }

  return { average, trend };
};

export const generateOverloadSuggestions = (data: SessionData): OverloadSuggestion[] => {
  const suggestions: OverloadSuggestion[] = [];
  const consistency = calculateConsistency(data.sessions, 14);

  if (consistency < CONSISTENCY_THRESHOLD) {
    return suggestions;
  }

  const activeIbadahTypes = data.ibadahTypes.filter((t) => !t.isArchived);

  for (const ibadahType of activeIbadahTypes) {
    const { average, trend } = getIbadahAverages(
      data.sessions,
      data.sessionSets,
      ibadahType.id,
      14
    );

    if (average === 0) continue;

    if (trend === 'increasing' || trend === 'stable') {
      const increasePercent =
        OVERLOAD_INCREASE_MIN + Math.random() * (OVERLOAD_INCREASE_MAX - OVERLOAD_INCREASE_MIN);
      const suggestedValue = Math.round(average * increasePercent * 10) / 10;

      if (suggestedValue > average) {
        suggestions.push({
          ibadahTypeId: ibadahType.id,
          ibadahName: ibadahType.name,
          ibadahNameArabic: ibadahType.nameArabic,
          currentAverage: Math.round(average * 10) / 10,
          suggestedValue,
          reason: `You've been consistent with ${ibadahType.name}. Consider a small increase.`,
        });
      }
    }
  }

  return suggestions;
};

export const shouldShowOverloadSuggestion = (
  sessions: Session[],
  ibadahTypeId: string,
  sessionSets: SessionSet[]
): boolean => {
  const { average, trend } = getIbadahAverages(sessions, sessionSets, ibadahTypeId, 7);

  if (average === 0) return false;

  const consistency = calculateConsistency(sessions, 7);
  return consistency >= 0.7 && (trend === 'stable' || trend === 'increasing');
};
