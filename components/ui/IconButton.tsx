import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TouchableOpacityProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

type IconButtonVariant = 'default' | 'primary' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends TouchableOpacityProps {
  icon: keyof typeof Feather.glyphMap;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
}

const ICON_SIZES: Record<IconButtonSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'md',
  color,
  disabled,
  style,
  ...props
}) => {
  const iconColor = color ?? (variant === 'primary' ? Colors.text.primary : Colors.text.secondary);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Feather name={icon} size={ICON_SIZES[size]} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  disabled: {
    opacity: 0.5,
  },

  variant_default: {
    backgroundColor: Colors.background.card,
  },
  variant_primary: {
    backgroundColor: Colors.accent.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  size_sm: {
    width: 32,
    height: 32,
  },
  size_md: {
    width: 44,
    height: 44,
  },
  size_lg: {
    width: 56,
    height: 56,
  },
});

export default IconButton;
