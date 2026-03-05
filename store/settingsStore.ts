import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, MinimumViableDay } from '../types';

interface SettingsState extends UserSettings {
  isLoaded: boolean;
}

interface SettingsActions {
  setOnboardingCompleted: (completed: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  setGlobalReminderEnabled: (enabled: boolean) => void;
  setGlobalReminderTime: (time: string) => void;
  setGlobalReminderNotificationId: (id: string | undefined) => void;
  setStreakMilestonesEnabled: (enabled: boolean) => void;
  setLastNotifiedStreakMilestone: (milestone: number) => void;
  setLanguage: (language: 'en' | 'ar') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setMinimumViableDay: (ibadahTypeId: string, minimumValue: number) => void;
  removeMinimumViableDay: (ibadahTypeId: string) => void;
  getMinimumViableDay: (ibadahTypeId: string) => number | undefined;
  setLastDayStarted: (date: string) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  minimumViableDays: [],
  notificationsEnabled: false,
  notificationTime: undefined,
  globalReminderEnabled: false,
  globalReminderTime: '09:00',
  globalReminderNotificationId: undefined,
  streakMilestonesEnabled: true,
  lastNotifiedStreakMilestone: 0,
  onboardingCompleted: false,
  language: 'en',
  theme: 'dark',
  lastDayStarted: '',
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      isLoaded: false,

      setOnboardingCompleted: (completed) => {
        set({ onboardingCompleted: completed });
      },

      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
      },

      setNotificationTime: (time) => {
        set({ notificationTime: time });
      },

      setGlobalReminderEnabled: (enabled) => {
        set({ globalReminderEnabled: enabled });
      },

      setGlobalReminderTime: (time) => {
        set({ globalReminderTime: time });
      },

      setGlobalReminderNotificationId: (id) => {
        set({ globalReminderNotificationId: id });
      },

      setStreakMilestonesEnabled: (enabled) => {
        set({ streakMilestonesEnabled: enabled });
      },

      setLastNotifiedStreakMilestone: (milestone) => {
        set({ lastNotifiedStreakMilestone: milestone });
      },

      setLanguage: (language) => {
        set({ language });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      setMinimumViableDay: (ibadahTypeId, minimumValue) => {
        set((state) => {
          const existingIndex = state.minimumViableDays.findIndex(
            (mvd) => mvd.ibadahTypeId === ibadahTypeId
          );

          const newMVD: MinimumViableDay = { ibadahTypeId, minimumValue };

          if (existingIndex >= 0) {
            const updated = [...state.minimumViableDays];
            updated[existingIndex] = newMVD;
            return { minimumViableDays: updated };
          }

          return { minimumViableDays: [...state.minimumViableDays, newMVD] };
        });
      },

      removeMinimumViableDay: (ibadahTypeId) => {
        set((state) => ({
          minimumViableDays: state.minimumViableDays.filter(
            (mvd) => mvd.ibadahTypeId !== ibadahTypeId
          ),
        }));
      },

      getMinimumViableDay: (ibadahTypeId) => {
        const mvd = get().minimumViableDays.find((m) => m.ibadahTypeId === ibadahTypeId);
        return mvd?.minimumValue;
      },

      setLastDayStarted: (date) => {
        set({ lastDayStarted: date });
      },

      resetSettings: () => {
        set({ ...DEFAULT_SETTINGS, isLoaded: true });
      },
    }),
    {
      name: 'ajr-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        minimumViableDays: state.minimumViableDays,
        notificationsEnabled: state.notificationsEnabled,
        notificationTime: state.notificationTime,
        globalReminderEnabled: state.globalReminderEnabled,
        globalReminderTime: state.globalReminderTime,
        globalReminderNotificationId: state.globalReminderNotificationId,
        streakMilestonesEnabled: state.streakMilestonesEnabled,
        lastNotifiedStreakMilestone: state.lastNotifiedStreakMilestone,
        onboardingCompleted: state.onboardingCompleted,
        language: state.language,
        theme: state.theme,
        lastDayStarted: state.lastDayStarted,
      }),
    }
  )
);
