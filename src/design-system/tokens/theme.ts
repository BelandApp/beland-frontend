/**
 * Design System - Theme System
 * Sistema de tema centralizado que combina todos los tokens
 */

import { colors } from "./colors";
import { spacing, semanticSpacing } from "./spacing";
import { typography, textStyles } from "./typography";
import { shadows, semanticShadows } from "./shadows";

// Tema principal de la aplicación
export const theme = {
  colors,
  spacing,
  semanticSpacing,
  typography,
  textStyles,
  shadows,
  semanticShadows,

  // Breakpoints para responsive design (aunque limitado en React Native)
  breakpoints: {
    sm: 375, // iPhone SE
    md: 768, // iPad mini
    lg: 1024, // iPad
    xl: 1280, // iPad Pro
  },

  // Z-index scale para layering
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Duración de animaciones
  animation: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300,
      slower: 500,
    },
    easing: {
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    },
  },
} as const;

// Tipos para TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;

// Hook para usar el tema (placeholder para futura implementación)
export const useTheme = () => theme;
