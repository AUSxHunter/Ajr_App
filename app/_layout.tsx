import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { Colors } from '../constants/theme';
import { HeaderBackButton } from '../components/ui';
import { useIbadahStore } from '../store/ibadahStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTranslation } from '../hooks/useTranslation';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const prepare = async () => {
      try {
        const raw = await AsyncStorage.getItem('ajr-settings-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          const lang = parsed?.state?.language;
          const rtl = lang === 'ar';
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(rtl);
        }
      } catch {
        // ignore storage errors
      }
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
    <View style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
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
            title: t('sessionDetail.title'),
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
