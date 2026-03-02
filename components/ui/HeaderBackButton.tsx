import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';

export const HeaderBackButton: React.FC = () => {
  const { isRTL } = useTranslation();
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
