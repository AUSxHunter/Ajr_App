import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { OverloadSuggestion } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface SuggestionCardProps {
  suggestion: OverloadSuggestion;
  onApply?: (suggestedValue: number) => void;
  onDismiss?: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
  onDismiss,
}) => {
  const { t, isRTL } = useTranslation();
  const displayName = isRTL
    ? (suggestion.ibadahNameArabic || suggestion.ibadahName)
    : suggestion.ibadahName;
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="trending-up" size={18} color={Colors.semantic.success} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('suggestions.progressiveOverload')}</Text>
          <Text style={styles.ibadahName}>{displayName}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Feather name="x" size={18} color={Colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.reason}>{suggestion.reason}</Text>

      <View style={styles.comparisonRow}>
        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>{t('suggestions.currentAvg')}</Text>
          <Text style={styles.currentValue}>{suggestion.currentAverage}</Text>
        </View>
        <Feather name="arrow-right" size={20} color={Colors.text.muted} />
        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>{t('suggestions.suggested')}</Text>
          <Text style={styles.suggestedValue}>{suggestion.suggestedValue}</Text>
        </View>
      </View>

      {onApply && (
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => onApply(suggestion.suggestedValue)}
        >
          <Text style={styles.applyButtonText}>{t('suggestions.tryToday')}</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.semantic.success}30`,
    backgroundColor: `${Colors.semantic.success}05`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.semantic.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '600',
    color: Colors.semantic.success,
  },
  ibadahName: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  dismissButton: {
    padding: Spacing.xs,
  },
  reason: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.4,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  valueBox: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  valueLabel: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
  },
  currentValue: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  suggestedValue: {
    fontSize: Typography.fontSize.h2,
    fontWeight: '700',
    color: Colors.semantic.success,
  },
  applyButton: {
    backgroundColor: Colors.semantic.success,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

export default SuggestionCard;
