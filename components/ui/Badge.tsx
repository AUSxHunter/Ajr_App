import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'md', style }) => {
  const Colors = useColors();

  const variantBg: Record<BadgeVariant, string> = {
    default: Colors.background.elevated,
    success: `${Colors.semantic.success}20`,
    warning: `${Colors.semantic.warning}20`,
    danger: `${Colors.semantic.danger}20`,
    info: `${Colors.accent.primary}20`,
  };

  return (
    <View style={[styles.container, styles[`size_${size}`], { backgroundColor: variantBg[variant] }, style]}>
      <Text style={[styles.text, styles[`text_${size}`], { color: Colors.text.primary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
  },
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  size_md: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
  },
  text: {
    fontWeight: '500',
  },
  text_sm: {
    fontSize: Typography.fontSize.xs,
  },
  text_md: {
    fontSize: Typography.fontSize.caption,
  },
});

export default Badge;
