export const palette = {
  // Google brand blues
  blue50: '#E8F0FE',
  blue100: '#D2E3FC',
  blue400: '#669DF6',
  blue600: '#1A73E8',
  blue700: '#1557B0',

  // Greens (attendance success)
  green50: '#E6F4EA',
  green600: '#1E8E3E',
  green700: '#0F9D58',

  // Reds (error / expired)
  red50: '#FCE8E6',
  red600: '#D93025',

  // Yellows (warning / timer)
  yellow50: '#FEF7E0',
  yellow600: '#F9AB00',

  // Neutrals — Google Material surfaces
  white: '#FFFFFF',
  gray50: '#F8F9FA',
  gray100: '#F1F3F4',
  gray200: '#E8EAED',
  gray300: '#DADCE0',
  gray500: '#9AA0A6',
  gray600: '#80868B',
  gray700: '#5F6368',
  gray900: '#202124',
  black: '#000000',

  // Dark mode surfaces
  dark900: '#1F1F1F',
  dark800: '#2D2D2D',
  dark700: '#3C3C3C',
  dark600: '#5F6368',
} as const;

export const Colors = {
  light: {
    // Backgrounds
    background: palette.gray100,
    surface: palette.white,
    backgroundElement: palette.gray200,
    backgroundSelected: palette.blue50,

    // Text
    text: palette.gray900,
    textSecondary: palette.gray700,
    textDisabled: palette.gray500,

    // Brand
    primary: palette.blue600,
    primaryLight: palette.blue50,
    primaryDark: palette.blue700,

    // Semantic
    success: palette.green600,
    successLight: palette.green50,
    error: palette.red600,
    errorLight: palette.red50,
    warning: palette.yellow600,
    warningLight: palette.yellow50,

    // Borders & dividers
    border: palette.gray300,
    divider: palette.gray200,
  },
  dark: {
    // Backgrounds
    background: palette.dark900,
    surface: palette.dark800,
    backgroundElement: palette.dark700,
    backgroundSelected: '#1A3A6E',

    // Text
    text: palette.gray200,
    textSecondary: palette.gray500,
    textDisabled: palette.dark600,

    // Brand
    primary: palette.blue400,
    primaryLight: '#1A3A6E',
    primaryDark: palette.blue600,

    // Semantic
    success: '#34A853',
    successLight: '#0A2E1A',
    error: '#EE675C',
    errorLight: '#3B1512',
    warning: '#FDD663',
    warningLight: '#3B2E00',

    // Borders & dividers
    border: palette.dark700,
    divider: palette.dark800,
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;
export type ThemeColorKey = keyof ThemeColors;
