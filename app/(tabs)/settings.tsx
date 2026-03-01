import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';
import { useSettingsStore } from '../../store/settingsStore';

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, value, onPress, rightElement }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingLeft}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color={Colors.text.secondary} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    {rightElement || (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && <Feather name="chevron-right" size={20} color={Colors.text.muted} />}
      </View>
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Ibadah</Text>
        <Card padding="none">
          <SettingRow
            icon="book-open"
            label="Manage Ibadah Types"
            onPress={() => router.push('/settings/manage-ibadah')}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="target"
            label="Minimum Viable Day"
            onPress={() => router.push('/settings/minimum-viable-day')}
          />
        </Card>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card padding="none">
          <SettingRow
            icon="bell"
            label="Notifications"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: Colors.background.elevated,
                  true: Colors.accent.muted,
                }}
                thumbColor={notificationsEnabled ? Colors.accent.primary : Colors.text.muted}
              />
            }
          />
        </Card>

        <Text style={styles.sectionTitle}>Account</Text>
        <Card padding="none">
          <SettingRow
            icon="cloud"
            label="Account & Sync"
            onPress={() => router.push('/settings/account')}
          />
        </Card>

        <Text style={styles.sectionTitle}>About</Text>
        <Card padding="none">
          <SettingRow icon="info" label="Version" value="1.0.0" />
          <View style={styles.separator} />
          <SettingRow icon="heart" label="About Ajr" onPress={() => {}} />
        </Card>
      </ScrollView>
    </SafeAreaView>
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
    marginTop: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingValue: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.muted,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginLeft: Spacing.md + 32 + Spacing.md,
  },
});
