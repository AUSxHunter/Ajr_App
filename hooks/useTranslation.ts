import { Alert, NativeModules, I18nManager } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { en, ar } from '../constants/i18n';
import { IbadahUnit } from '../types';

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val)),
    template
  );
}

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  const translations = (language === 'ar' ? ar : en) as Record<string, any>;
  const isRTL = language === 'ar';

  function t(key: string, vars?: Record<string, string | number>): string {
    const value = getNestedValue(translations, key);
    if (value === undefined) return key;
    if (!vars) return value;
    return interpolate(value, vars);
  }

  function tUnit(unit: IbadahUnit, count: number): string {
    const unitData = translations.units?.[unit];
    if (!unitData) return unit;
    return count === 1 ? unitData.singular : unitData.plural;
  }

  function reloadApp(targetIsRTL?: boolean) {
    const rtl = targetIsRTL ?? isRTL;
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(rtl);
    try {
      NativeModules.DevSettings?.reload();
    } catch {
      Alert.alert(
        'Restart Required',
        'Please close and reopen the app to apply the language change.'
      );
    }
  }

  return { t, tUnit, isRTL, reloadApp };
}
