/**
 * Design System - Typography Tokens
 * Sistema tipográfico unificado para toda la aplicación
 */

export const typography = {
  // Font families
  fontFamily: {
    primary: "System", // React Native default
    mono: "Courier New", // Para código o números
  },

  // Font sizes (basado en escala modular)
  fontSize: {
    xs: 12, // 0.75rem
    sm: 14, // 0.875rem
    base: 16, // 1rem - Base size
    lg: 18, // 1.125rem
    xl: 20, // 1.25rem
    "2xl": 24, // 1.5rem
    "3xl": 30, // 1.875rem
    "4xl": 36, // 2.25rem
    "5xl": 48, // 3rem
    "6xl": 60, // 3.75rem
    "7xl": 72, // 4.5rem
    "8xl": 96, // 6rem
    "9xl": 128, // 8rem
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.1,
    snug: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 2,
  },

  // Font weights
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
};

// Semantic typography styles
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSize["4xl"],
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontSize: typography.fontSize["3xl"],
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontSize: typography.fontSize["2xl"],
    lineHeight: typography.lineHeight.snug,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.snug,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  h5: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  h6: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Body text
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // UI text
  button: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.none,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  overline: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: "uppercase" as const,
  },
};
