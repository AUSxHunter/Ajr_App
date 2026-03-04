import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Spacing } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useColors } from '../../hooks/useColors';

export const HeaderBackButton: React.FC = () => {
  const { isRTL } = useTranslation();
  const Colors = useColors();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ paddingRight: Spacing.md }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Feather name={isRTL ? 'chevron-right' : 'chevron-left'} size={24} color={Colors.text.primary} />
    </TouchableOpacity>
  );
};

export default HeaderBackButton;
