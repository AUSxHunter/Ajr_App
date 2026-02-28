import { Session, SessionSet, BurnoutWarning } from '../types';
import { BURNOUT_THRESHOLD } from '../constants/defaults';
import { subDays, format } from 'date-fns';

interface BurnoutData {
  sessions: Session[];
  sessionSets: SessionSet[];
}

const getWeeklyVolume = (
  data: BurnoutData,
  startDate: Date
): { totalVolume: number; activeDays: number } => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(format(subDays(startDate, i), 'yyyy-MM-dd'));
  }

  const weeklySessions = data.sessions.filter((s) => dates.includes(s.sessionDate));

  let totalVolume = 0;
  weeklySessions.forEach((session) => {
    const sets = data.sessionSets.filter((s) => s.sessionId === session.id);
    totalVolume += sets.reduce((sum, s) => sum + s.value, 0);
  });

  return {
    totalVolume,
    activeDays: weeklySessions.length,
  };
};

export const detectBurnout = (data: BurnoutData): BurnoutWarning => {
  const today = new Date();

  const currentWeek = getWeeklyVolume(data, today);
  const previousWeek = getWeeklyVolume(data, subDays(today, 7));

  if (previousWeek.totalVolume === 0 || previousWeek.activeDays < 3) {
    return {
      detected: false,
      severity: 'mild',
      message: '',
      suggestedDeloadPercentage: 0,
    };
  }

  if (currentWeek.activeDays < 3) {
    return {
      detected: false,
      severity: 'mild',
      message: '',
      suggestedDeloadPercentage: 0,
    };
  }

  const volumeRatio = currentWeek.totalVolume / previousWeek.totalVolume;

  if (volumeRatio >= BURNOUT_THRESHOLD) {
    return {
      detected: false,
      severity: 'mild',
      message: '',
      suggestedDeloadPercentage: 0,
    };
  }

  let severity: 'mild' | 'moderate' | 'severe';
  let message: string;
  let suggestedDeloadPercentage: number;

  if (volumeRatio >= 0.5) {
    severity = 'mild';
    message =
      'Your volume has decreased slightly. Consider maintaining your current pace or taking a light day.';
    suggestedDeloadPercentage = 10;
  } else if (volumeRatio >= 0.3) {
    severity = 'moderate';
    message =
      'Your ibadah volume has dropped noticeably. A recovery period might help restore your energy.';
    suggestedDeloadPercentage = 25;
  } else {
    severity = 'severe';
    message =
      "Significant decrease detected. It's recommended to take a deload week and focus on your minimum viable day.";
    suggestedDeloadPercentage = 40;
  }

  return {
    detected: true,
    severity,
    message,
    suggestedDeloadPercentage,
  };
};

export const getDeloadRecommendation = (
  currentAverage: number,
  deloadPercentage: number
): number => {
  return Math.round(currentAverage * (1 - deloadPercentage / 100) * 10) / 10;
};

export const isRecoveryPeriodActive = (sessions: Session[], sessionSets: SessionSet[]): boolean => {
  const warning = detectBurnout({ sessions, sessionSets });
  return warning.detected && warning.severity !== 'mild';
};

export const getRecoveryProgress = (
  data: BurnoutData
): { progress: number; daysRemaining: number } | null => {
  const warning = detectBurnout(data);

  if (!warning.detected) {
    return null;
  }

  const daysInRecovery = Math.min(
    7,
    data.sessions.filter((s) => {
      const sessionDate = new Date(s.sessionDate);
      const daysDiff = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length
  );

  const recoveryDuration = warning.severity === 'severe' ? 7 : 5;
  const progress = Math.min(100, (daysInRecovery / recoveryDuration) * 100);
  const daysRemaining = Math.max(0, recoveryDuration - daysInRecovery);

  return { progress, daysRemaining };
};
