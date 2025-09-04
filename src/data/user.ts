/**
 * Constantes del usuario actual
 * En una implementación real, esto vendría de un contexto de autenticación
 */

export const CURRENT_USER = {
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID válido para el usuario de prueba
  name: "Usuario Actual",
  instagramUsername: "mi_usuario",
} as const;

export const CURRENT_USER_ID = CURRENT_USER.id;
