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
  setLanguage: (language: 'en' | 'ar') => void;
  setMinimumViableDay: (ibadahTypeId: string, minimumValue: number) => void;
  removeMinimumViableDay: (ibadahTypeId: string) => void;
  getMinimumViableDay: (ibadahTypeId: string) => number | undefined;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  minimumViableDays: [],
  notificationsEnabled: false,
  notificationTime: undefined,
  onboardingCompleted: false,
  language: 'en',
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

      setLanguage: (language) => {
        set({ language });
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
        onboardingCompleted: state.onboardingCompleted,
        language: state.language,
      }),
    }
  )
);
