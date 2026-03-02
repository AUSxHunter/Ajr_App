import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

export default function AboutScreen() {
  const { t, isRTL } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('about.title') }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Feather name="heart" size={48} color={Colors.accent.primary} />
            </View>
            <Text style={styles.appName}>Ajr</Text>
            <Text style={[styles.tagline, { textAlign: 'center' }]}>{t('about.tagline')}</Text>
          </View>

          {/* Description card */}
          <Card>
            <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('about.description')}
            </Text>
          </Card>

          {/* Info card */}
          <Card style={styles.infoCard}>
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('about.developerLabel')}
              </Text>
              <Text style={[styles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('about.developerName')}
              </Text>
            </View>
            <View style={styles.infoSeparator} />
            <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('about.contactLabel')}
              </Text>
              <Text style={[styles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('about.contactEmail')}
              </Text>
            </View>
          </Card>

          {/* Privacy Policy link */}
          <TouchableOpacity
            style={[styles.privacyRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => router.push('/settings/privacy')}
            activeOpacity={0.7}
          >
            <Feather name="shield" size={18} color={Colors.accent.primary} />
            <Text style={styles.privacyLabel}>{t('about.privacyPolicy')}</Text>
            <Feather
              name={isRTL ? 'chevron-left' : 'chevron-right'}
              size={18}
              color={Colors.text.muted}
            />
          </TouchableOpacity>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.accent.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: Typography.fontSize.h1,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  tagline: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.6,
  },
  infoCard: {
    gap: 0,
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: Colors.border.default,
  },
  infoLabel: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  infoValue: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    flex: 2,
  },
  privacyRow: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  privacyLabel: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    color: Colors.accent.primary,
    fontWeight: '500',
  },
});
