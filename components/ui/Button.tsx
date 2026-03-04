import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacityProps,
} from 'react-native';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const Colors = useColors();
  const isDisabled = disabled || loading;

  const variantStyle: ViewStyle =
    variant === 'secondary'
      ? { backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.border.default }
      : variant === 'danger'
      ? { backgroundColor: Colors.semantic.danger }
      : variant === 'ghost'
      ? { backgroundColor: 'transparent' }
      : { backgroundColor: Colors.accent.primary };

  const textColor =
    variant === 'ghost' ? Colors.accent.primary : Colors.text.primary;

  const buttonStyles: StyleProp<ViewStyle> = [
    styles.base,
    styles[`size_${size}`],
    variantStyle,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style as ViewStyle,
  ];

  const textStyles: StyleProp<TextStyle> = [
    styles.text,
    styles[`text_${size}`],
    { color: textColor },
    isDisabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity style={buttonStyles} disabled={isDisabled} activeOpacity={0.7} {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.text.primary : Colors.accent.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  text: {
    fontWeight: '600',
  },
  textDisabled: {
    opacity: 0.7,
  },
  text_sm: {
    fontSize: Typography.fontSize.bodySmall,
  },
  text_md: {
    fontSize: Typography.fontSize.body,
  },
  text_lg: {
    fontSize: Typography.fontSize.bodyLarge,
  },
});

export default Button;
