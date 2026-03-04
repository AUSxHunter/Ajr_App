import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Typography, Spacing } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const Colors = useColors();
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={48} color={Colors.text.muted} />
      </View>
      <Text style={[styles.title, { color: Colors.text.primary }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: Colors.text.secondary }]}>{description}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          variant="primary"
          size="md"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.body,
    textAlign: 'center',
    lineHeight: Typography.fontSize.body * Typography.lineHeight.relaxed,
  },
  button: {
    marginTop: Spacing.lg,
  },
});

export default EmptyState;
