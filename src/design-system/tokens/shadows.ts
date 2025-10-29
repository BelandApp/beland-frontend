/**
 * Design System - Shadow Tokens
 * Sistema de sombras unificado para elevation y depth
 */

// Sombras para diferentes niveles de elevación
export const shadows = {
  // Sin sombra
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Android
  },

  // Sombras sutiles
  xs: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Sombras medias
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  // Sombras prominentes
  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  "2xl": {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 16,
  },
};

// Sombras semánticas para casos de uso específicos
export const semanticShadows = {
  // Cards y contenedores
  card: shadows.sm,
  cardHover: shadows.md,
  cardActive: shadows.lg,

  // Modales y overlays
  modal: shadows.xl,
  dropdown: shadows.lg,
  tooltip: shadows.md,

  // Botones
  button: shadows.xs,
  buttonHover: shadows.sm,
  buttonActive: shadows.none,

  // Navegación
  bottomTab: shadows.lg,
  header: shadows.sm,

  // Estados especiales
  focus: {
    shadowColor: "#F88D2A", // Primary color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 0,
  },
};
