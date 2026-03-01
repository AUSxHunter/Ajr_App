import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '../constants/theme';
import { HeaderBackButton } from '../components/ui';
import { useIbadahStore } from '../store/ibadahStore';
import { useSettingsStore } from '../store/settingsStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const prepare = async () => {
      useIbadahStore.getState().initializeDefaults();
      setIsReady(true);
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  useEffect(() => {
    if (isReady && !onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [isReady, onboardingCompleted]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background.primary,
          },
          headerTintColor: Colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.background.primary,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="session/[id]"
          options={{
            title: 'Session Details',
            presentation: 'card',
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="adhkar"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding/index"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});
