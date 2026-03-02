import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

export default function AccountScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('account.title') }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconSection}>
            <View style={styles.iconContainer}>
              <Feather name="cloud-off" size={48} color={Colors.text.muted} />
            </View>
            <Text style={styles.title}>{t('account.cloudSync')}</Text>
            <Text style={styles.description}>{t('account.cloudSyncDesc')}</Text>
          </View>

          <Card style={styles.comingSoonCard}>
            <Feather name="clock" size={24} color={Colors.accent.primary} />
            <View style={styles.comingSoonText}>
              <Text style={styles.comingSoonTitle}>{t('account.comingSoon')}</Text>
              <Text style={styles.comingSoonDescription}>{t('account.comingSoonDesc')}</Text>
            </View>
          </Card>

          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>{t('account.plannedFeatures')}</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>{t('account.syncAcrossDevices')}</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>{t('account.automaticBackup')}</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>{t('account.dataExport')}</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>{t('account.encryption')}</Text>
              </View>
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
  iconSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  description: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  comingSoonCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: `${Colors.accent.primary}10`,
    borderWidth: 1,
    borderColor: Colors.accent.muted,
  },
  comingSoonText: {
    flex: 1,
    gap: Spacing.xs,
  },
  comingSoonTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
  comingSoonDescription: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.bodySmall * 1.4,
  },
  featuresCard: {
    gap: Spacing.md,
  },
  featuresTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
});
