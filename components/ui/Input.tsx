import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: Parameters<NonNullable<typeof onFocus>>[0]) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<typeof onBlur>>[0]) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputContainerStyles: ViewStyle[] = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error ? styles.inputContainerError : null,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={Colors.text.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

export const NumberInput: React.FC<InputProps & { min?: number; max?: number }> = ({
  min,
  max,
  onChangeText,
  ...props
}) => {
  const handleChangeText = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, '');

    if (numericText === '' || numericText === '.') {
      onChangeText?.(numericText);
      return;
    }

    const numValue = parseFloat(numericText);
    if (isNaN(numValue)) {
      onChangeText?.('');
      return;
    }

    if (min !== undefined && numValue < min) {
      onChangeText?.(min.toString());
      return;
    }

    if (max !== undefined && numValue > max) {
      onChangeText?.(max.toString());
      return;
    }

    onChangeText?.(numericText);
  };

  return <Input keyboardType="numeric" onChangeText={handleChangeText} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  inputContainerFocused: {
    borderColor: Colors.accent.primary,
  },
  inputContainerError: {
    borderColor: Colors.semantic.danger,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  iconLeft: {
    paddingLeft: Spacing.md,
  },
  iconRight: {
    paddingRight: Spacing.md,
  },
  error: {
    fontSize: Typography.fontSize.caption,
    color: Colors.semantic.danger,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: Typography.fontSize.caption,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
});

export default Input;
