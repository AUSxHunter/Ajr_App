import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Button, Card } from '../../components/ui';
import { useSettingsStore } from '../../store/settingsStore';
import { useIbadahStore } from '../../store/ibadahStore';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);

  const setOnboardingCompleted = useSettingsStore((state) => state.setOnboardingCompleted);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const ibadahTypesRaw = useIbadahStore((state) => state.ibadahTypes);
  const archiveIbadahType = useIbadahStore((state) => state.archiveIbadahType);
  const restoreIbadahType = useIbadahStore((state) => state.restoreIbadahType);
  const ibadahTypes = useMemo(
    () =>
      ibadahTypesRaw.filter((type) => !type.isArchived).sort((a, b) => a.sortOrder - b.sortOrder),
    [ibadahTypesRaw]
  );
  const { t } = useTranslation();

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

  // Step 0 = language picker; steps 1-3 = onboarding content
  const contentSteps = [
    {
      title: t('onboarding.step1Title'),
      description: t('onboarding.step1Desc'),
      icon: 'sun' as const,
    },
    {
      title: t('onboarding.step2Title'),
      description: t('onboarding.step2Desc'),
      icon: 'trending-up' as const,
    },
    {
      title: t('onboarding.step3Title'),
      description: t('onboarding.step3Desc'),
      icon: 'check-square' as const,
    },
  ];

  const totalSteps = 1 + contentSteps.length; // language step + 3 content steps
  const isLastStep = step === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  // Step 0: Language selection
  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.welcomeContent}>
            <View style={styles.iconContainer}>
              <Feather name="globe" size={64} color={Colors.accent.primary} />
            </View>
            <Text style={styles.title}>{t('onboarding.step0Title')}</Text>
            <Text style={styles.description}>{t('onboarding.step0Desc')}</Text>
            <View style={styles.langCards}>
              <TouchableOpacity
                style={[styles.langCard, language === 'en' && styles.langCardSelected]}
                onPress={() => setLanguage('en')}
                activeOpacity={0.8}
              >
                <Text style={styles.langCardFlag}>🇬🇧</Text>
                <Text style={styles.langCardText}>{t('onboarding.english')}</Text>
                {language === 'en' && (
                  <View style={styles.langCheckmark}>
                    <Feather name="check" size={16} color={Colors.text.primary} />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langCard, language === 'ar' && styles.langCardSelected]}
                onPress={() => setLanguage('ar')}
                activeOpacity={0.8}
              >
                <Text style={styles.langCardFlag}>🇸🇦</Text>
                <Text style={styles.langCardText}>{t('onboarding.arabic')}</Text>
                {language === 'ar' && (
                  <View style={styles.langCheckmark}>
                    <Feather name="check" size={16} color={Colors.text.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.buttons}>
            <Button title={t('onboarding.next')} variant="primary" onPress={handleNext} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Steps 1-3: content steps
  const currentStep = contentSteps[step - 1];
  const isIbadahStep = step === totalSteps - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!isIbadahStep ? (
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
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.buttons}>
          <Button
            title={isLastStep ? t('onboarding.getStarted') : t('onboarding.next')}
            variant="primary"
            onPress={handleNext}
            fullWidth
          />
          {step > 0 && (
            <Button
              title={t('onboarding.back')}
              variant="ghost"
              onPress={() => setStep(step - 1)}
              fullWidth
            />
          )}
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
  langCards: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  langCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.card,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    gap: Spacing.sm,
  },
  langCardSelected: {
    borderColor: Colors.accent.primary,
  },
  langCardFlag: {
    fontSize: 32,
  },
  langCardText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  langCheckmark: {
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
    flexDirection: 'column',
    gap: Spacing.sm,
  },
});
