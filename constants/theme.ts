export const Colors = {
  background: {
    primary: '#000000',
    secondary: '#0A0A0A',
    card: '#141414',
    elevated: '#1A1A1A',
  },
  accent: {
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    muted: '#1E3A5F',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#52525B',
    inverse: '#000000',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  border: {
    default: '#27272A',
    light: '#3F3F46',
    accent: '#3B82F6',
  },
  ibadah: {
    quran: '#22C55E',
    qiyam: '#8B5CF6',
    dhikr: '#F59E0B',
    sadaqah: '#EC4899',
    fasting: '#06B6D4',
    dua: '#14B8A6',
    custom: '#6366F1',
  },
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    caption: 12,
    bodySmall: 14,
    body: 16,
    bodyLarge: 18,
    h3: 20,
    h2: 22,
    h1: 28,
    display: 36,
    displayLarge: 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
};

export default theme;
