import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { AdhkarType, ADHKAR_SABAH, ADHKAR_MASAA } from '../constants/adhkar';

interface AdhkarProgress {
  [adhkarId: string]: number;
}

interface DailyAdhkarState {
  date: string;
  sabahProgress: AdhkarProgress;
  masaaProgress: AdhkarProgress;
  sabahCompletedAt: string | null;
  masaaCompletedAt: string | null;
}

interface AdhkarStore {
  dailyState: DailyAdhkarState;
  
  getProgress: (type: AdhkarType, adhkarId: string) => number;
  getTotalProgress: (type: AdhkarType) => { completed: number; total: number };
  isCompleted: (type: AdhkarType) => boolean;
  getCompletedAt: (type: AdhkarType) => string | null;
  
  incrementCount: (type: AdhkarType, adhkarId: string) => void;
  setCount: (type: AdhkarType, adhkarId: string, count: number) => void;
  markComplete: (type: AdhkarType) => void;
  resetProgress: (type: AdhkarType) => void;
  resetDaily: () => void;
  
  checkAndResetIfNewDay: () => void;
}

const getInitialState = (): DailyAdhkarState => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  sabahProgress: {},
  masaaProgress: {},
  sabahCompletedAt: null,
  masaaCompletedAt: null,
});

export const useAdhkarStore = create<AdhkarStore>()(
  persist(
    (set, get) => ({
      dailyState: getInitialState(),

      getProgress: (type: AdhkarType, adhkarId: string) => {
        const progress = type === 'sabah'
          ? get().dailyState.sabahProgress
          : get().dailyState.masaaProgress;
        return progress[adhkarId] || 0;
      },

      getTotalProgress: (type: AdhkarType) => {
        const adhkarList = type === 'sabah' ? ADHKAR_SABAH : ADHKAR_MASAA;
        const progress = type === 'sabah'
          ? get().dailyState.sabahProgress
          : get().dailyState.masaaProgress;

        const total = adhkarList.length;
        const completed = adhkarList.filter((adhkar) => {
          const currentCount = progress[adhkar.id] || 0;
          return currentCount >= adhkar.count;
        }).length;

        return { completed, total };
      },

      isCompleted: (type: AdhkarType) => {
        return type === 'sabah'
          ? get().dailyState.sabahCompletedAt !== null
          : get().dailyState.masaaCompletedAt !== null;
      },

      getCompletedAt: (type: AdhkarType) => {
        return type === 'sabah'
          ? get().dailyState.sabahCompletedAt
          : get().dailyState.masaaCompletedAt;
      },

      incrementCount: (type: AdhkarType, adhkarId: string) => {
        get().checkAndResetIfNewDay();
        set((state) => {
          const progressKey = type === 'sabah' ? 'sabahProgress' : 'masaaProgress';
          const currentProgress = state.dailyState[progressKey];
          const currentCount = currentProgress[adhkarId] || 0;
          
          return {
            dailyState: {
              ...state.dailyState,
              [progressKey]: {
                ...currentProgress,
                [adhkarId]: currentCount + 1,
              },
            },
          };
        });
      },

      setCount: (type: AdhkarType, adhkarId: string, count: number) => {
        get().checkAndResetIfNewDay();
        set((state) => {
          const progressKey = type === 'sabah' ? 'sabahProgress' : 'masaaProgress';
          const currentProgress = state.dailyState[progressKey];
          
          return {
            dailyState: {
              ...state.dailyState,
              [progressKey]: {
                ...currentProgress,
                [adhkarId]: Math.max(0, count),
              },
            },
          };
        });
      },

      markComplete: (type: AdhkarType) => {
        get().checkAndResetIfNewDay();
        const completedAtKey = type === 'sabah' ? 'sabahCompletedAt' : 'masaaCompletedAt';
        set((state) => ({
          dailyState: {
            ...state.dailyState,
            [completedAtKey]: new Date().toISOString(),
          },
        }));
      },

      resetProgress: (type: AdhkarType) => {
        const progressKey = type === 'sabah' ? 'sabahProgress' : 'masaaProgress';
        const completedAtKey = type === 'sabah' ? 'sabahCompletedAt' : 'masaaCompletedAt';
        set((state) => ({
          dailyState: {
            ...state.dailyState,
            [progressKey]: {},
            [completedAtKey]: null,
          },
        }));
      },

      resetDaily: () => {
        set({ dailyState: getInitialState() });
      },

      checkAndResetIfNewDay: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { dailyState } = get();
        
        if (dailyState.date !== today) {
          set({ dailyState: getInitialState() });
        }
      },
    }),
    {
      name: 'adhkar-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
