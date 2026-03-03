import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import { IbadahType } from '../../types';

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

// ─── Utilities ────────────────────────────────────────────────────────────────

export function parseTime(hhmm: string): { hour: number; minute: number } {
  const parts = hhmm.split(':');
  const hour = parseInt(parts[0] ?? '9', 10);
  const minute = parseInt(parts[1] ?? '0', 10);
  return {
    hour: isNaN(hour) ? 9 : Math.max(0, Math.min(23, hour)),
    minute: isNaN(minute) ? 0 : Math.max(0, Math.min(59, minute)),
  };
}

export function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export function openNotificationSettings(): void {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

// ─── Notification content ─────────────────────────────────────────────────────

function getIbadahContent(ibadah: IbadahType, lang: 'en' | 'ar') {
  if (lang === 'ar') {
    return {
      title: 'تذكير أجر',
      body: `حان وقت: ${ibadah.nameArabic || ibadah.name}`,
    };
  }
  return {
    title: 'Ajr Reminder',
    body: `Time for: ${ibadah.name}`,
  };
}

function getGlobalContent(lang: 'en' | 'ar') {
  if (lang === 'ar') {
    return {
      title: 'أجر',
      body: 'لا تنسَ تسجيل عبادتك اليوم.',
    };
  }
  return {
    title: 'Ajr',
    body: "Don't forget to log your ibadah today.",
  };
}

function getStreakContent(streakCount: number, lang: 'en' | 'ar') {
  if (lang === 'ar') {
    return {
      title: 'إنجاز السلسلة 🔥',
      body: `لقد وصلت إلى ${streakCount} أيام متتالية. استمر!`,
    };
  }
  return {
    title: 'Streak Milestone 🔥',
    body: `You reached a ${streakCount}-day streak. Keep going!`,
  };
}

// ─── Per-ibadah reminders ─────────────────────────────────────────────────────

export async function scheduleIbadahReminder(
  ibadah: IbadahType,
  lang: 'en' | 'ar'
): Promise<string[]> {
  const { hour, minute } = parseTime(ibadah.reminderTime);
  const content = getIbadahContent(ibadah, lang);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return [id];
}

export async function cancelIbadahReminder(ids: string[]): Promise<void> {
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Silently ignore stale IDs (e.g. after app reinstall)
    }
  }
}

export async function rescheduleIbadahReminder(
  ibadah: IbadahType,
  lang: 'en' | 'ar'
): Promise<string[]> {
  await cancelIbadahReminder(ibadah.reminderNotificationIds);
  return scheduleIbadahReminder(ibadah, lang);
}

// ─── Global reminder ──────────────────────────────────────────────────────────

export async function scheduleGlobalReminder(
  time: string,
  lang: 'en' | 'ar'
): Promise<string> {
  const { hour, minute } = parseTime(time);
  const content = getGlobalContent(lang);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

export async function cancelGlobalReminder(id?: string): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Silently ignore stale ID
  }
}

// ─── Streak milestone ─────────────────────────────────────────────────────────

export async function fireStreakMilestoneNotification(
  streakCount: number,
  lang: 'en' | 'ar'
): Promise<void> {
  const content = getStreakContent(streakCount, lang);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: null, // immediate
  });
}
