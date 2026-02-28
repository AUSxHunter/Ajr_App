import { create } from 'zustand';
import { TimerMode, TimerState } from '../types';

interface TimerStoreState extends TimerState {
  linkedIbadahTypeId: string | null;
}

interface TimerActions {
  startTimer: (mode: TimerMode, targetSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  updateElapsed: (seconds: number) => void;
  setLinkedIbadah: (ibadahTypeId: string | null) => void;
  getFormattedTime: () => string;
  getRemainingSeconds: () => number;
  isComplete: () => boolean;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const useTimerStore = create<TimerStoreState & TimerActions>()((set, get) => ({
  mode: 'stopwatch',
  isRunning: false,
  elapsedSeconds: 0,
  targetSeconds: undefined,
  startedAt: undefined,
  linkedIbadahTypeId: null,

  startTimer: (mode, targetSeconds) => {
    set({
      mode,
      isRunning: true,
      elapsedSeconds: 0,
      targetSeconds,
      startedAt: new Date(),
    });
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  resumeTimer: () => {
    set({ isRunning: true });
  },

  resetTimer: () => {
    set({
      isRunning: false,
      elapsedSeconds: 0,
      startedAt: undefined,
    });
  },

  updateElapsed: (seconds) => {
    set({ elapsedSeconds: seconds });
  },

  setLinkedIbadah: (ibadahTypeId) => {
    set({ linkedIbadahTypeId: ibadahTypeId });
  },

  getFormattedTime: () => {
    const { mode, elapsedSeconds, targetSeconds } = get();
    if (mode === 'countdown' && targetSeconds) {
      const remaining = Math.max(0, targetSeconds - elapsedSeconds);
      return formatTime(remaining);
    }
    return formatTime(elapsedSeconds);
  },

  getRemainingSeconds: () => {
    const { mode, elapsedSeconds, targetSeconds } = get();
    if (mode === 'countdown' && targetSeconds) {
      return Math.max(0, targetSeconds - elapsedSeconds);
    }
    return 0;
  },

  isComplete: () => {
    const { mode, elapsedSeconds, targetSeconds } = get();
    if (mode === 'countdown' && targetSeconds) {
      return elapsedSeconds >= targetSeconds;
    }
    return false;
  },
}));
