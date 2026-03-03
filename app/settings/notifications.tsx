import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getPermissionStatus,
  requestPermissions,
  openNotificationSettings,
  scheduleGlobalReminder,
  cancelGlobalReminder,
  canScheduleExact,
  openExactAlarmSettings,
  parseTime,
  formatTime,
} from '../../services/notifications/notificationService';

export default function NotificationsScreen() {
  const { t, isRTL } = useTranslation();
  const language = useSettingsStore((state) => state.language);

  const globalReminderEnabled = useSettingsStore((state) => state.globalReminderEnabled);
  const globalReminderTime = useSettingsStore((state) => state.globalReminderTime);
  const globalReminderNotificationId = useSettingsStore(
    (state) => state.globalReminderNotificationId
  );
  const streakMilestonesEnabled = useSettingsStore((state) => state.streakMilestonesEnabled);

  const setGlobalReminderEnabled = useSettingsStore((state) => state.setGlobalReminderEnabled);
  const setGlobalReminderTime = useSettingsStore((state) => state.setGlobalReminderTime);
  const setGlobalReminderNotificationId = useSettingsStore(
    (state) => state.setGlobalReminderNotificationId
  );
  const setStreakMilestonesEnabled = useSettingsStore((state) => state.setStreakMilestonesEnabled);

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined'
  );
  const [exactAlarmGranted, setExactAlarmGranted] = useState(true);
  const [showAndroidTimePicker, setShowAndroidTimePicker] = useState(false);

  const getTimeDate = (): Date => {
    const { hour, minute } = parseTime(globalReminderTime);
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  // Re-check permissions whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      getPermissionStatus().then(setPermissionStatus);
      canScheduleExact().then(setExactAlarmGranted);
    }, [])
  );

  const handleGlobalReminderToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(t('notifications.permissionDeniedTitle'), t('notifications.permissionDenied'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('notifications.openSettings'), onPress: openNotificationSettings },
        ]);
        setPermissionStatus('denied');
        return;
      }
      setPermissionStatus('granted');
    }

    try {
      if (value) {
        const id = await scheduleGlobalReminder(globalReminderTime, language);
        setGlobalReminderNotificationId(id);
      } else {
        await cancelGlobalReminder(globalReminderNotificationId);
        setGlobalReminderNotificationId(undefined);
      }
      setGlobalReminderEnabled(value);
    } catch {
      setGlobalReminderEnabled(value);
    }
  };

  const handleTimeChange = async (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidTimePicker(false);
    }
    if (!selected) return;

    const newTime = formatTime(selected);
    setGlobalReminderTime(newTime);

    if (globalReminderEnabled) {
      try {
        await cancelGlobalReminder(globalReminderNotificationId);
        const newId = await scheduleGlobalReminder(newTime, language);
        setGlobalReminderNotificationId(newId);
      } catch {
        // Scheduling failed silently
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('notifications.title') }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Permission denied banner */}
          {permissionStatus === 'denied' && (
            <TouchableOpacity style={styles.permissionBanner} onPress={openNotificationSettings}>
              <Feather name="alert-triangle" size={18} color={Colors.semantic.warning} />
              <Text style={styles.permissionBannerText}>{t('notifications.permissionDenied')}</Text>
              <Feather
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={16}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          )}

          {/* Exact alarm permission banner (Android 12+) */}
          {!exactAlarmGranted && (
            <TouchableOpacity style={styles.exactAlarmBanner} onPress={openExactAlarmSettings}>
              <Feather name="clock" size={18} color={Colors.semantic.error} />
              <Text style={styles.exactAlarmBannerText}>{t('notifications.exactAlarmRequired')}</Text>
              <Feather
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={16}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          )}

          {/* Global Reminder section */}
          <Text style={styles.sectionTitle}>{t('notifications.globalReminder')}</Text>
          <Card padding="none">
            <View style={[styles.row, isRTL && styles.rowRTL]}>
              <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
                <View style={styles.iconContainer}>
                  <Feather name="bell" size={20} color={Colors.text.secondary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{t('notifications.globalReminder')}</Text>
                  <Text style={styles.rowDesc}>{t('notifications.globalReminderDesc')}</Text>
                </View>
              </View>
              <Switch
                value={globalReminderEnabled}
                onValueChange={handleGlobalReminderToggle}
                trackColor={{
                  false: Colors.background.elevated,
                  true: Colors.accent.muted,
                }}
                thumbColor={globalReminderEnabled ? Colors.accent.primary : Colors.text.muted}
              />
            </View>

            {globalReminderEnabled && (
              <>
                <View style={styles.separator} />
                <View style={[styles.row, isRTL && styles.rowRTL]}>
                  <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
                    <View style={styles.iconContainer}>
                      <Feather name="clock" size={20} color={Colors.text.secondary} />
                    </View>
                    <Text style={styles.rowLabel}>{t('notifications.reminderTime')}</Text>
                  </View>

                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      value={getTimeDate()}
                      mode="time"
                      display="compact"
                      onChange={handleTimeChange}
                      style={styles.compactPicker}
                      textColor={Colors.text.primary}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowAndroidTimePicker(true)}
                      style={styles.timeChip}
                    >
                      <Text style={styles.timeChipText}>{globalReminderTime}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {showAndroidTimePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={getTimeDate()}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </>
            )}
          </Card>

          {/* Streak Milestones section */}
          <Text style={styles.sectionTitle}>{t('notifications.streakMilestones')}</Text>
          <Card padding="none">
            <View style={[styles.row, isRTL && styles.rowRTL]}>
              <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
                <View style={styles.iconContainer}>
                  <Feather name="zap" size={20} color={Colors.text.secondary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{t('notifications.streakMilestones')}</Text>
                  <Text style={styles.rowDesc}>{t('notifications.streakMilestonesDesc')}</Text>
                </View>
              </View>
              <Switch
                value={streakMilestonesEnabled}
                onValueChange={setStreakMilestonesEnabled}
                trackColor={{
                  false: Colors.background.elevated,
                  true: Colors.accent.muted,
                }}
                thumbColor={
                  streakMilestonesEnabled ? Colors.accent.primary : Colors.text.muted
                }
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: '600',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.semantic.warning}18`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  permissionBannerText: {
    flex: 1,
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.semantic.warning,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  rowLeftRTL: {
    flexDirection: 'row-reverse',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  rowDesc: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
    marginTop: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginLeft: Spacing.md + 32 + Spacing.md,
  },
  compactPicker: {
    height: 34,
  },
  exactAlarmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.semantic.error}18`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  exactAlarmBannerText: {
    flex: 1,
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.semantic.error,
  },
  timeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.elevated,
  },
  timeChipText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
});
