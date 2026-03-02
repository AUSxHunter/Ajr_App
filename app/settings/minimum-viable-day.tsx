import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, NumberInput, Button } from '../../components/ui';
import { useIbadahStore } from '../../store/ibadahStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function MinimumViableDayScreen() {
  const { t, tUnit } = useTranslation();
  const ibadahTypesRaw = useIbadahStore((state) => state.ibadahTypes);
  const ibadahTypes = useMemo(
    () =>
      ibadahTypesRaw.filter((type) => !type.isArchived).sort((a, b) => a.sortOrder - b.sortOrder),
    [ibadahTypesRaw]
  );
  const minimumViableDays = useSettingsStore((state) => state.minimumViableDays);
  const setMinimumViableDay = useSettingsStore((state) => state.setMinimumViableDay);
  const removeMinimumViableDay = useSettingsStore((state) => state.removeMinimumViableDay);
  const getMinimumViableDay = useSettingsStore((state) => state.getMinimumViableDay);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    minimumViableDays.forEach((mvd) => {
      initial[mvd.ibadahTypeId] = mvd.minimumValue.toString();
    });
    return initial;
  });

  const handleValueChange = (ibadahTypeId: string, value: string) => {
    setValues((prev) => ({ ...prev, [ibadahTypeId]: value }));
  };

  const handleSave = (ibadahTypeId: string) => {
    const value = parseFloat(values[ibadahTypeId] || '0');
    if (value > 0) {
      setMinimumViableDay(ibadahTypeId, value);
    } else {
      removeMinimumViableDay(ibadahTypeId);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('mvd.title') }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Feather name="info" size={20} color={Colors.accent.primary} />
              <Text style={styles.infoTitle}>{t('mvd.whatIsMVD')}</Text>
            </View>
            <Text style={styles.infoText}>{t('mvd.mvdExplanation')}</Text>
          </Card>

          <Text style={styles.sectionTitle}>{t('mvd.setYourMinimums')}</Text>

          <View style={styles.list}>
            {ibadahTypes.map((type) => {
              const currentMVD = getMinimumViableDay(type.id);
              const inputValue = values[type.id] ?? (currentMVD?.toString() || '');

              return (
                <Card key={type.id} style={styles.ibadahCard}>
                  <View style={styles.ibadahHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${type.color}20` }]}>
                      <Feather
                        name={type.icon as keyof typeof Feather.glyphMap}
                        size={18}
                        color={type.color}
                      />
                    </View>
                    <Text style={styles.ibadahName}>{type.name}</Text>
                  </View>

                  <View style={styles.inputRow}>
                    <NumberInput
                      value={inputValue}
                      onChangeText={(v) => handleValueChange(type.id, v)}
                      placeholder="0"
                      containerStyle={styles.inputWrapper}
                    />
                    <Text style={styles.unitLabel}>{tUnit(type.unit, 2)}</Text>
                    <Button
                      title={t('mvd.save')}
                      variant="ghost"
                      size="sm"
                      onPress={() => handleSave(type.id)}
                    />
                  </View>

                  {currentMVD && (
                    <Text style={styles.currentValue}>
                      {t('mvd.current', { value: currentMVD, unit: tUnit(type.unit, currentMVD) })}
                    </Text>
                  )}
                </Card>
              );
            })}
          </View>

          <Card style={styles.tipCard}>
            <Feather name="sun" size={20} color={Colors.semantic.warning} />
            <Text style={styles.tipText}>{t('mvd.tip')}</Text>
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
  infoCard: {
    gap: Spacing.sm,
    backgroundColor: `${Colors.accent.primary}10`,
    borderWidth: 1,
    borderColor: Colors.accent.muted,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.accent.primary,
  },
  infoText: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.5,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  list: {
    gap: Spacing.md,
  },
  ibadahCard: {
    gap: Spacing.md,
  },
  ibadahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ibadahName: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapper: {
    width: 80,
  },
  unitLabel: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    color: Colors.text.muted,
  },
  currentValue: {
    fontSize: Typography.fontSize.caption,
    color: Colors.semantic.success,
  },
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: `${Colors.semantic.warning}10`,
    borderWidth: 1,
    borderColor: `${Colors.semantic.warning}30`,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.bodySmall * 1.5,
  },
});
