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

export async function canScheduleExact(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const perms = await Notifications.getPermissionsAsync();
    const exact = (perms as any).canScheduleExactNotifications;
    return exact !== false;
  } catch {
    return true;
  }
}

export function openExactAlarmSettings(): void {
  if (Platform.OS === 'android') {
    Linking.openURL('android.settings.REQUEST_SCHEDULE_EXACT_ALARM').catch(() =>
      Linking.openSettings()
    );
  }
}

export function openNotificationSettings(): void {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

// ─── Notification content ─────────────────────────────────────────────────────

const GLOBAL_MESSAGES_EN = [
  { title: 'Your Ajr is waiting ✦', body: 'A moment of worship shapes your day. Log it now.' },
  { title: 'Stay consistent', body: 'The best deeds are the ones done regularly, even if small.' },
  { title: 'Build your streak 🔥', body: "Don't break the chain — your spiritual streak is counting on you." },
  { title: 'Time for ibadah', body: 'Small acts, great rewards. Open Ajr and log your worship.' },
  { title: 'Your Ajr is building', body: 'Every consistent day adds up. Keep the momentum going.' },
  { title: 'A reminder for you ✦', body: 'Take a moment for your ibadah. Your future self will thank you.' },
  { title: 'Consistency is worship', body: 'Log today\'s ibadah and keep your streak alive.' },
  { title: 'You\'ve got this', body: 'One step at a time. Open Ajr and log what you\'ve done today.' },
];

const GLOBAL_MESSAGES_AR = [
  { title: 'أجرك ينتظرك ✦', body: 'لحظة عبادة تُشكّل يومك. سجّلها الآن.' },
  { title: 'حافظ على الاستمرارية', body: 'أحب الأعمال إلى الله أدومها وإن قلّ.' },
  { title: 'ابنِ سلسلتك 🔥', body: 'لا تقطع السلسلة — سلسلتك الروحية تعتمد عليك.' },
  { title: 'حان وقت العبادة', body: 'أعمال صغيرة، أجر عظيم. افتح أجر وسجّل عبادتك.' },
  { title: 'أجرك يتراكم', body: 'كل يوم منتظم يُضيف إلى رصيدك. واصل المسيرة.' },
  { title: 'تذكير لك ✦', body: 'خصّص لحظة لعبادتك. ستشكر نفسك لاحقاً.' },
  { title: 'الاتساق عبادة', body: 'سجّل عبادة اليوم وحافظ على سلسلتك.' },
  { title: 'أنت قادر', body: 'خطوة واحدة في كل مرة. افتح أجر وسجّل ما أنجزته اليوم.' },
];

function pickDaily<T>(arr: T[]): T {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return arr[dayIndex % arr.length]!;
}

function getIbadahContent(ibadah: IbadahType, lang: 'en' | 'ar') {
  const name = lang === 'ar' ? (ibadah.nameArabic || ibadah.name) : ibadah.name;
  if (lang === 'ar') {
    return { title: `حان وقت ${name} ✦`, body: 'افتح أجر وسجّل جلستك الآن.' };
  }
  return { title: `Time for ${name} ✦`, body: 'Open Ajr and log your session now.' };
}

function getGlobalContent(lang: 'en' | 'ar') {
  return pickDaily(lang === 'ar' ? GLOBAL_MESSAGES_AR : GLOBAL_MESSAGES_EN);
}

function getStreakContent(streakCount: number, lang: 'en' | 'ar') {
  if (lang === 'ar') {
    return {
      title: `${streakCount} أيام متتالية 🔥`,
      body: 'إنجاز رائع. استمر في بناء عادتك الروحية.',
    };
  }
  return {
    title: `${streakCount}-Day Streak 🔥`,
    body: 'Incredible consistency. Keep building your spiritual habit.',
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
      sound: 'default',
      android: { channelId: 'default' },
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
      sound: 'default',
      android: { channelId: 'default' },
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
      sound: 'default',
      android: { channelId: 'default' },
    },
    trigger: null, // immediate
  });
}
