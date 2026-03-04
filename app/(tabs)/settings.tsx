import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useColors } from '../../hooks/useColors';

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, value, onPress, rightElement }) => {
  const { isRTL } = useTranslation();
  const Colors = useColors();
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: Colors.background.elevated }]}>
          <Feather name={icon} size={20} color={Colors.text.secondary} />
        </View>
        <Text style={[styles.settingLabel, { color: Colors.text.primary }]}>{label}</Text>
      </View>
      {rightElement || (
        <View style={styles.settingRight}>
          {value && <Text style={[styles.settingValue, { color: Colors.text.muted }]}>{value}</Text>}
          {onPress && <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.text.muted} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const { t, reloadApp } = useTranslation();
  const Colors = useColors();

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    if (lang === language) return;
    const newIsRTL = lang === 'ar';
    setLanguage(lang);
    Alert.alert(t('languageChange.title'), t('languageChange.message'), [
      {
        text: t('languageChange.cancel'),
        style: 'cancel',
        onPress: () => setLanguage(language),
      },
      {
        text: t('languageChange.restartNow'),
        onPress: () => reloadApp(newIsRTL),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background.primary }]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: Colors.text.muted }]}>{t('settings.ibadah')}</Text>
        <Card padding="none">
          <SettingRow
            icon="book-open"
            label={t('settings.manageIbadahTypes')}
            onPress={() => router.push('/settings/manage-ibadah')}
          />
          <View style={[styles.separator, { backgroundColor: Colors.border.default }]} />
          <SettingRow
            icon="plus-circle"
            label={t('settings.addCustomIbadah')}
            onPress={() => router.push('/settings/manage-ibadah?openAdd=true')}
          />
          <View style={[styles.separator, { backgroundColor: Colors.border.default }]} />
          <SettingRow
            icon="target"
            label={t('settings.minimumViableDay')}
            onPress={() => router.push('/settings/minimum-viable-day')}
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: Colors.text.muted }]}>{t('settings.preferences')}</Text>
        <Card padding="none">
          <SettingRow
            icon="bell"
            label={t('settings.notifications')}
            onPress={() => router.push('/settings/notifications')}
          />
          <View style={[styles.separator, { backgroundColor: Colors.border.default }]} />
          <SettingRow
            icon="globe"
            label={t('settings.language')}
            rightElement={
              <View style={styles.chipPicker}>
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: Colors.background.elevated }, language === 'en' && { backgroundColor: Colors.accent.primary }]}
                  onPress={() => handleLanguageChange('en')}
                >
                  <Text style={[styles.chipText, { color: Colors.text.muted }, language === 'en' && { color: Colors.text.inverse }]}>
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: Colors.background.elevated }, language === 'ar' && { backgroundColor: Colors.accent.primary }]}
                  onPress={() => handleLanguageChange('ar')}
                >
                  <Text style={[styles.chipText, { color: Colors.text.muted }, language === 'ar' && { color: Colors.text.inverse }]}>
                    عر
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
          <View style={[styles.separator, { backgroundColor: Colors.border.default }]} />
          <SettingRow
            icon="moon"
            label={t('settings.appearance')}
            rightElement={
              <View style={styles.chipPicker}>
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: Colors.background.elevated }, theme === 'dark' && { backgroundColor: Colors.accent.primary }]}
                  onPress={() => setTheme('dark')}
                >
                  <Text style={[styles.chipText, { color: Colors.text.muted }, theme === 'dark' && { color: Colors.text.inverse }]}>
                    {t('settings.dark')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, { backgroundColor: Colors.background.elevated }, theme === 'light' && { backgroundColor: Colors.accent.primary }]}
                  onPress={() => setTheme('light')}
                >
                  <Text style={[styles.chipText, { color: Colors.text.muted }, theme === 'light' && { color: Colors.text.inverse }]}>
                    {t('settings.light')}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: Colors.text.muted }]}>{t('settings.account')}</Text>
        <Card padding="none">
          <SettingRow
            icon="cloud"
            label={t('settings.accountSync')}
            onPress={() => router.push('/settings/account')}
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: Colors.text.muted }]}>{t('settings.about')}</Text>
        <Card padding="none">
          <SettingRow icon="info" label={t('settings.version')} value="1.0.0" />
          <View style={[styles.separator, { backgroundColor: Colors.border.default }]} />
          <SettingRow icon="heart" label={t('settings.aboutAjr')} onPress={() => router.push('/settings/about')} />
          <View style={[styles.separator, { backgroundColor: Colors.border.default }]} />
          <SettingRow icon="shield" label={t('settings.privacyPolicy')} onPress={() => router.push('/settings/privacy')} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: Typography.fontSize.body,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingValue: {
    fontSize: Typography.fontSize.body,
  },
  separator: {
    height: 1,
    marginLeft: Spacing.md + 32 + Spacing.md,
  },
  chipPicker: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    minWidth: 36,
    alignItems: 'center',
  },
  chipText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
  },
});
