import { Stack } from 'expo-router';
import { Colors, Typography } from '../../constants/theme';
import { HeaderBackButton } from '../../components/ui';

export default function SettingsLayout() {
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
