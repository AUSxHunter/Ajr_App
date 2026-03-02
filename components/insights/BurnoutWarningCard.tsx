import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { BurnoutWarning } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface BurnoutWarningCardProps {
  warning: BurnoutWarning;
  onDismiss?: () => void;
}

export const BurnoutWarningCard: React.FC<BurnoutWarningCardProps> = ({ warning, onDismiss }) => {
  const { t } = useTranslation();

  const SEVERITY_CONFIG = {
    mild: {
      color: Colors.semantic.info,
      icon: 'info' as const,
      title: t('burnout.mildTitle'),
    },
    moderate: {
      color: Colors.semantic.warning,
      icon: 'alert-triangle' as const,
      title: t('burnout.moderateTitle'),
    },
    severe: {
      color: Colors.semantic.danger,
      icon: 'alert-circle' as const,
      title: t('burnout.severeTitle'),
    },
  };

  const config = SEVERITY_CONFIG[warning.severity];

  return (
    <Card
      style={[
        styles.container,
        {
          borderColor: `${config.color}30`,
          backgroundColor: `${config.color}05`,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
          <Feather name={config.icon} size={18} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Feather name="x" size={18} color={Colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.message}>{warning.message}</Text>

      {warning.suggestedDeloadPercentage > 0 && (
        <View style={styles.deloadInfo}>
          <Feather name="trending-down" size={16} color={Colors.text.muted} />
          <Text style={styles.deloadText}>
            {t('burnout.deloadText', { percentage: warning.suggestedDeloadPercentage })}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
  },
  dismissButton: {
    padding: Spacing.xs,
  },
  message: {
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.body * 1.4,
  },
  deloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  deloadText: {
    flex: 1,
    fontSize: Typography.fontSize.bodySmall,
    color: Colors.text.muted,
  },
});

export default BurnoutWarningCard;
