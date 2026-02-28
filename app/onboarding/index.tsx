import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Button, Card } from '../../components/ui';
import { useSettingsStore } from '../../store/settingsStore';
import { useIbadahStore } from '../../store/ibadahStore';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);

  const setOnboardingCompleted = useSettingsStore((state) => state.setOnboardingCompleted);
  const ibadahTypesRaw = useIbadahStore((state) => state.ibadahTypes);
  const archiveIbadahType = useIbadahStore((state) => state.archiveIbadahType);
  const restoreIbadahType = useIbadahStore((state) => state.restoreIbadahType);
  const ibadahTypes = useMemo(
    () =>
      ibadahTypesRaw.filter((type) => !type.isArchived).sort((a, b) => a.sortOrder - b.sortOrder),
    [ibadahTypesRaw]
  );

  const [selectedIbadah, setSelectedIbadah] = useState<string[]>(() =>
    ibadahTypes.map((type) => type.id)
  );

  const handleComplete = () => {
    ibadahTypes.forEach((type) => {
      if (selectedIbadah.includes(type.id)) {
        restoreIbadahType(type.id);
      } else {
        archiveIbadahType(type.id);
      }
    });
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  const toggleIbadah = (id: string) => {
    setSelectedIbadah((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const steps = [
    {
      title: 'Welcome to Ajr',
      description:
        'Track your daily ibadah with intention and consistency. Build spiritual habits that last.',
      icon: 'sun' as const,
    },
    {
      title: 'Progressive Growth',
      description:
        'Just like physical training, spiritual growth happens gradually. Small increases compound into significant progress.',
      icon: 'trending-up' as const,
    },
    {
      title: 'Choose Your Ibadah',
      description: 'Select the types of worship you want to track. You can always add more later.',
      icon: 'check-square' as const,
    },
  ];

  const currentStep = steps[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {step < 2 ? (
          <View style={styles.welcomeContent}>
            <View style={styles.iconContainer}>
              <Feather name={currentStep.icon} size={64} color={Colors.accent.primary} />
            </View>
            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.description}>{currentStep.description}</Text>
          </View>
        ) : (
          <View style={styles.selectContent}>
            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.description}>{currentStep.description}</Text>
            <View style={styles.ibadahGrid}>
              {ibadahTypes.map((type) => (
                <Card
                  key={type.id}
                  style={[
                    styles.ibadahCard,
                    selectedIbadah.includes(type.id) && styles.ibadahCardSelected,
                  ]}
                  onPress={() => toggleIbadah(type.id)}
                  pressable
                >
                  <View style={[styles.ibadahIcon, { backgroundColor: `${type.color}20` }]}>
                    <Feather
                      name={type.icon as keyof typeof Feather.glyphMap}
                      size={24}
                      color={type.color}
                    />
                  </View>
                  <Text style={styles.ibadahName}>{type.name}</Text>
                  {selectedIbadah.includes(type.id) && (
                    <View style={styles.checkmark}>
                      <Feather name="check" size={16} color={Colors.text.primary} />
                    </View>
                  )}
                </Card>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.buttons}>
          {step > 0 && (
            <Button
              title="Back"
              variant="ghost"
              onPress={() => setStep(step - 1)}
              style={styles.backButton}
            />
          )}
          <Button
            title={step === steps.length - 1 ? 'Get Started' : 'Next'}
            variant="primary"
            onPress={() => {
              if (step === steps.length - 1) {
                handleComplete();
              } else {
                setStep(step + 1);
              }
            }}
            fullWidth={step === 0}
            style={step > 0 ? styles.nextButton : undefined}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  selectContent: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.accent.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.body * 1.6,
    maxWidth: 300,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  ibadahGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  ibadahCard: {
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    position: 'relative',
  },
  ibadahCardSelected: {
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  ibadahIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  ibadahName: {
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border.default,
  },
  dotActive: {
    backgroundColor: Colors.accent.primary,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
