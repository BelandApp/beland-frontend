export const getBackendErrorMessage = (err: any): string => {
  if (!err) return "Ocurrió un error inesperado. Intenta de nuevo.";
  if (err?.status === 401) return "Sesión expirada. Inicia sesión nuevamente.";
  return (
    err?.body?.message ||
    err?.message ||
    "Ocurrió un error inesperado. Intenta de nuevo."
  );
};
