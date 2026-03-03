import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Modal } from '../ui';
import { Button } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { IbadahType } from '../../types';
import { useIbadahStore } from '../../store/ibadahStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import {
  requestPermissions,
  openNotificationSettings,
  rescheduleIbadahReminder,
  cancelIbadahReminder,
  formatTime,
} from '../../services/notifications/notificationService';

interface ReminderModalProps {
  ibadah: IbadahType | null;
  visible: boolean;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ ibadah, visible, onClose }) => {
  const { t, isRTL } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const updateIbadahReminder = useIbadahStore((state) => state.updateIbadahReminder);

  const [enabled, setEnabled] = useState(false);
  const [timeDate, setTimeDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state from ibadah when modal opens
  useEffect(() => {
    if (ibadah && visible) {
      setEnabled(ibadah.reminderEnabled);
      const [h, m] = ibadah.reminderTime.split(':').map(Number);
      const d = new Date();
      d.setHours(h ?? 9, m ?? 0, 0, 0);
      setTimeDate(d);
      setShowAndroidPicker(false);
    }
  }, [ibadah, visible]);

  const handleTimeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
    }
    if (selected) {
      setTimeDate(selected);
    }
  };

  const handleSave = async () => {
    if (!ibadah) return;
    setIsSaving(true);

    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) {
        setIsSaving(false);
        Alert.alert(
          t('notifications.permissionDeniedTitle'),
          t('notifications.permissionDenied'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('notifications.openSettings'),
              onPress: openNotificationSettings,
            },
          ]
        );
        return;
      }
    }

    try {
      const reminderTime = formatTime(timeDate);
      let newIds: string[] = [];

      if (enabled) {
        newIds = await rescheduleIbadahReminder(
          { ...ibadah, reminderEnabled: true, reminderTime },
          language
        );
      } else {
        await cancelIbadahReminder(ibadah.reminderNotificationIds);
      }

      updateIbadahReminder(ibadah.id, {
        reminderEnabled: enabled,
        reminderTime,
        reminderNotificationIds: newIds,
      });

      onClose();
    } catch {
      // Notification scheduling failed — still save the toggle state
      updateIbadahReminder(ibadah.id, {
        reminderEnabled: enabled,
        reminderTime: formatTime(timeDate),
        reminderNotificationIds: [],
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const ibadahName = ibadah
    ? isRTL
      ? ibadah.nameArabic || ibadah.name
      : ibadah.name
    : '';

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`${t('notifications.setReminder')} — ${ibadahName}`}
      position="bottom"
    >
      <View style={styles.content}>
        {/* Remind me toggle */}
        <View style={[styles.row, isRTL && styles.rowRTL]}>
          <Text style={styles.rowLabel}>{t('notifications.remindMe')}</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{
              false: Colors.background.elevated,
              true: Colors.accent.muted,
            }}
            thumbColor={enabled ? Colors.accent.primary : Colors.text.muted}
          />
        </View>

        {/* Time picker (only shown when enabled) */}
        {enabled && (
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>{t('notifications.time')}</Text>

            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={timeDate}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.iosPicker}
                textColor={Colors.text.primary}
              />
            ) : (
              <View style={[styles.row, isRTL && styles.rowRTL]}>
                <Text style={styles.timeDisplay}>
                  {formatTime(timeDate)}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAndroidPicker(true)}
                  style={styles.setTimeButton}
                >
                  <Text style={styles.setTimeButtonText}>{t('notifications.setTime')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {showAndroidPicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={timeDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        )}

        <Button
          title={t('common.save')}
          variant="primary"
          fullWidth
          onPress={handleSave}
          disabled={isSaving}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  rowLabel: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  timeSection: {
    gap: Spacing.sm,
  },
  timeLabel: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  iosPicker: {
    height: 120,
  },
  timeDisplay: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  setTimeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.elevated,
  },
  setTimeButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
});
