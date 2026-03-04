import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  pressable?: boolean;
}

export const Card: React.FC<CardProps & Partial<TouchableOpacityProps>> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  onPress,
  pressable = false,
  ...props
}) => {
  const Colors = useColors();

  const variantStyle: ViewStyle =
    variant === 'elevated'
      ? { backgroundColor: Colors.background.elevated, ...Shadows.md }
      : variant === 'outlined'
      ? { backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.border.default }
      : { backgroundColor: Colors.background.card };

  const cardStyles: StyleProp<ViewStyle> = [
    styles.base,
    styles[`padding_${padding}`],
    variantStyle,
    style,
  ];

  if (pressable || onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: Spacing.sm,
  },
  padding_md: {
    padding: Spacing.md,
  },
  padding_lg: {
    padding: Spacing.lg,
  },
});

export default Card;
