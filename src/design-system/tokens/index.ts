/**
 * Design System - Tokens Index
 * Punto de entrada unificado para todos los tokens del design system
 */

// Re-exports de todos los tokens
export { colors, legacyColors } from "./colors";
export { spacing, semanticSpacing } from "./spacing";
export { typography, textStyles } from "./typography";
export { shadows, semanticShadows } from "./shadows";
export { theme, useTheme } from "./theme";

// Types
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
} from "./theme";
