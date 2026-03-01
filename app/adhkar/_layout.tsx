import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';
import { HeaderBackButton } from '../../components/ui';

export default function AdhkarLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background.primary,
        },
        headerTintColor: Colors.text.primary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="[type]"
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
