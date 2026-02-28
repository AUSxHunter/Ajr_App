export type IbadahUnit = 'pages' | 'minutes' | 'count' | 'currency' | 'binary' | 'ayat';

export interface IbadahType {
  id: string;
  name: string;
  nameArabic?: string;
  unit: IbadahUnit;
  icon: string;
  color: string;
  weight: number;
  isDefault: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionDate: string;
  startedAt: Date;
  completedAt?: Date;
  totalVolume: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionSet {
  id: string;
  sessionId: string;
  ibadahTypeId: string;
  value: number;
  durationSeconds?: number;
  notes?: string;
  setOrder: number;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type RecordType = 'daily_volume' | 'single_set' | 'streak';

export interface PersonalRecord {
  id: string;
  ibadahTypeId: string;
  recordType: RecordType;
  value: number;
  achievedDate: string;
  createdAt: Date;
}

export interface MinimumViableDay {
  ibadahTypeId: string;
  minimumValue: number;
}

export interface UserSettings {
  minimumViableDays: MinimumViableDay[];
  notificationsEnabled: boolean;
  notificationTime?: string;
  privacyModeEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface SessionWithSets extends Session {
  sets: SessionSetWithIbadah[];
}

export interface SessionSetWithIbadah extends SessionSet {
  ibadahType: IbadahType;
}

export interface DailyStats {
  date: string;
  totalVolume: number;
  setCount: number;
  ibadahBreakdown: {
    ibadahTypeId: string;
    ibadahName: string;
    totalValue: number;
    setCount: number;
  }[];
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalVolume: number;
  averageDailyVolume: number;
  activeDays: number;
  dailyStats: DailyStats[];
}

export interface OverloadSuggestion {
  ibadahTypeId: string;
  ibadahName: string;
  currentAverage: number;
  suggestedValue: number;
  reason: string;
}

export interface BurnoutWarning {
  detected: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  message: string;
  suggestedDeloadPercentage: number;
}

export type TimerMode = 'stopwatch' | 'countdown';

export interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  elapsedSeconds: number;
  targetSeconds?: number;
  startedAt?: Date;
}
