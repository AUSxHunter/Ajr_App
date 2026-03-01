import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui';

export default function AccountScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Account & Sync' }} />
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
            <Text style={styles.title}>Cloud Sync</Text>
            <Text style={styles.description}>
              Sign in to sync your data across devices and back up your progress.
            </Text>
          </View>

          <Card style={styles.comingSoonCard}>
            <Feather name="clock" size={24} color={Colors.accent.primary} />
            <View style={styles.comingSoonText}>
              <Text style={styles.comingSoonTitle}>Coming Soon</Text>
              <Text style={styles.comingSoonDescription}>
                Cloud sync and account features are currently in development. Your data is safely
                stored on your device.
              </Text>
            </View>
          </Card>

          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Planned Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>Sync across devices</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>Automatic backup</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>Data export/import</Text>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={Colors.semantic.success} />
                <Text style={styles.featureText}>End-to-end encryption</Text>
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
