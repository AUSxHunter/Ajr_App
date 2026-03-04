import { useSettingsStore } from '../store/settingsStore';
import { DarkColors, LightColors, ColorScheme } from '../constants/theme';

export function useColors(): ColorScheme {
  const theme = useSettingsStore((state) => state.theme);
  return theme === 'light' ? LightColors : DarkColors;
}
