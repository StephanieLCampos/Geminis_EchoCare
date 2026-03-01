import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { colors } from './colors';

export const echocareTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: colors.authBg,
    onPrimaryContainer: colors.primary,
    secondary: colors.accent,
    onSecondary: colors.white,
    secondaryContainer: colors.authBg,
    onSecondaryContainer: colors.primary,
    tertiary: colors.accent,
    onTertiary: colors.white,
    outline: colors.primary,
    outlineVariant: colors.muted,
    surface: colors.white,
    surfaceVariant: colors.authBg,
    background: colors.authBg,
  },
  roundness: 12,
};
