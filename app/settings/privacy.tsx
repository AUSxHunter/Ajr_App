import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

interface SectionCardProps {
  title: string;
  body: string;
  isRTL: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, body, isRTL }) => (
  <Card style={styles.sectionCard}>
    <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
    <Text style={[styles.sectionBody, { textAlign: isRTL ? 'right' : 'left' }]}>{body}</Text>
  </Card>
);

export default function PrivacyScreen() {
  const { t, isRTL } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('privacy.title') }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro */}
          <View style={styles.introSection}>
            <Text style={[styles.lastUpdated, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('privacy.lastUpdated')}
            </Text>
            <Text style={[styles.intro, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('privacy.intro')}
            </Text>
          </View>

          {/* Section cards */}
          <SectionCard
            title={t('privacy.noCollectionTitle')}
            body={t('privacy.noCollectionBody')}
            isRTL={isRTL}
          />
          <SectionCard
            title={t('privacy.localStorageTitle')}
            body={t('privacy.localStorageBody')}
            isRTL={isRTL}
          />
          <SectionCard
            title={t('privacy.noTrackingTitle')}
            body={t('privacy.noTrackingBody')}
            isRTL={isRTL}
          />
          <SectionCard
            title={t('privacy.noInternetTitle')}
            body={t('privacy.noInternetBody')}
            isRTL={isRTL}
          />

          {/* Contact card */}
          <Card style={styles.contactCard}>
            <Text style={[styles.contactTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('privacy.contactTitle')}
            </Text>
            <Text style={[styles.contactBody, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('privacy.contactBody')}
            </Text>
            <Text style={[styles.contactEmail, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('privacy.contactEmail')}
            </Text>
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
  introSection: {
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  lastUpdated: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
  },
  intro: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.6,
  },
  sectionCard: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  sectionBody: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.6,
  },
  contactCard: {
    gap: Spacing.sm,
    backgroundColor: `${Colors.accent.primary}10`,
    borderWidth: 1,
    borderColor: Colors.accent.muted,
  },
  contactTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  contactBody: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.6,
  },
  contactEmail: {
    fontSize: Typography.fontSize.body,
    color: Colors.accent.primary,
    fontWeight: '500',
  },
});
