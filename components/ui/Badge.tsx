import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'md', style }) => {
  return (
    <View style={[styles.container, styles[`variant_${variant}`], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${size}`]]}>{label}</Text>
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

  variant_default: {
    backgroundColor: Colors.background.elevated,
  },
  variant_success: {
    backgroundColor: `${Colors.semantic.success}20`,
  },
  variant_warning: {
    backgroundColor: `${Colors.semantic.warning}20`,
  },
  variant_danger: {
    backgroundColor: `${Colors.semantic.danger}20`,
  },
  variant_info: {
    backgroundColor: `${Colors.accent.primary}20`,
  },

  text: {
    fontWeight: '500',
    color: Colors.text.primary,
  },

  text_sm: {
    fontSize: Typography.fontSize.xs,
  },
  text_md: {
    fontSize: Typography.fontSize.caption,
  },
});

export default Badge;
