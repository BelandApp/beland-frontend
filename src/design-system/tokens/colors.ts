/**
 * Design System - Color Tokens
 * Paleta de colores unificada para toda la aplicación
 */

export const colors = {
  // Brand Colors - Identidad visual de Beland
  brand: {
    orange: {
      50: "#FFF7ED",
      100: "#FFEDD5",
      200: "#FED7AA",
      300: "#FDBA74",
      400: "#FB923C",
      500: "#F88D2A", // Principal
      600: "#EA580C",
      700: "#C2410C",
      800: "#9A3412",
      900: "#7C2D12",
    },
    green: {
      50: "#F0F9F0",
      100: "#DCEFDC",
      200: "#BBE1BB",
      300: "#8FCE8F",
      400: "#6BA43A", // Principal
      500: "#5A9234",
      600: "#4A7A2B",
      700: "#3B6322",
      800: "#2E4F1B",
      900: "#234015",
    },
  },

  // Primary Scale - Para elementos principales
  primary: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F88D2A",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },

  // Semantic Colors - Estados y feedback
  semantic: {
    success: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B",
    },
    error: {
      50: "#FEF2F2",
      100: "#FEE2E2",
      200: "#FECACA",
      300: "#FCA5A5",
      400: "#F87171",
      500: "#EF4444",
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D",
    },
    warning: {
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F",
    },
    info: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
    },
  },

  // Neutral Scale - Grises y tonos neutros
  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
    950: "#030712",
  },

  // Background Colors
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
    tertiary: "#F3F4F6",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Text Colors
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    disabled: "#D1D5DB",
    inverse: "#FFFFFF",
  },

  // Border Colors
  border: {
    default: "#E5E7EB",
    secondary: "#D1D5DB",
    focus: "#F88D2A",
    error: "#EF4444",
  },
};

// Legacy colors export para mantener compatibilidad
export const legacyColors = {
  belandOrange: colors.brand.orange[500],
  belandGreen: colors.brand.green[400],
  belandGreenLight: colors.brand.green[200],
  primary: colors.primary[500],
  background: colors.background.primary,
  cardBackground: colors.background.secondary,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  blue50: colors.semantic.info[50],
  blue200: colors.semantic.info[200],
  blue700: colors.semantic.info[700],
  success: colors.semantic.success[500],
  error: colors.semantic.error[500],
  warning: colors.semantic.warning[500],
};
