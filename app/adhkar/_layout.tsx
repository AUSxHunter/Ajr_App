import { Stack } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { HeaderBackButton } from '../../components/ui';

export default function AdhkarLayout() {
  const Colors = useColors();
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
