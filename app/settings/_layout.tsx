import { Stack } from 'expo-router';
import { Typography } from '../../constants/theme';
import { HeaderBackButton } from '../../components/ui';
import { useColors } from '../../hooks/useColors';

export default function SettingsLayout() {
  const Colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background.primary,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: Typography.fontSize.h3,
        },
        headerShadowVisible: false,
        headerLeft: () => <HeaderBackButton />,
        contentStyle: {
          backgroundColor: Colors.background.primary,
        },
      }}
    />
  );
}
