import { CSSProperties } from "react";

export const actionButtonStyles = {
  container: {
    marginBottom: 24,
    width: "100%",
    position: "sticky" as const,
    bottom: 20,
    zIndex: 10,
  } as CSSProperties,

  primaryButton: {
    width: "100%",
    fontWeight: 700,
    fontSize: 18,
    padding: "20px 24px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    marginBottom: 12,
    position: "relative" as const,
    overflow: "hidden" as const,
    textAlign: "center" as const,
    boxShadow:
      "0 12px 32px rgba(0, 122, 255, 0.3), 0 4px 16px rgba(0, 122, 255, 0.15)",
    transform: "translateY(0)",
  } as CSSProperties,

  primaryButtonEnabled: {
    background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
    color: "#fff",
    boxShadow:
      "0 12px 32px rgba(0, 122, 255, 0.35), 0 4px 16px rgba(88, 86, 214, 0.2)",
    transform: "translateY(-1px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  } as CSSProperties,

  primaryButtonEnabledBecoin: {
    background: "linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)",
    color: "#fff",
    boxShadow:
      "0 12px 32px rgba(255, 149, 0, 0.35), 0 4px 16px rgba(255, 107, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  } as CSSProperties,

  primaryButtonEnabledFree: {
    background: "linear-gradient(135deg, #34C759 0%, #30B147 100%)",
    color: "#fff",
    boxShadow:
      "0 12px 32px rgba(52, 199, 89, 0.35), 0 4px 16px rgba(48, 177, 71, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  } as CSSProperties,

  primaryButtonDisabled: {
    background: "#E5E7EB",
    color: "#9CA3AF",
    cursor: "not-allowed",
    boxShadow: "none",
  } as CSSProperties,

  primaryButtonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  } as CSSProperties,

  secondaryButton: {
    background: "#fff",
    color: "#007AFF",
    fontWeight: 600,
    fontSize: 16,
    padding: "14px 24px",
    borderRadius: 12,
    border: "2px solid #007AFF",
    width: "100%",
    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.1)",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "center" as const,
  } as CSSProperties,

  buttonShimmer: {
    position: "absolute" as const,
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    animation: "shimmer 2s infinite",
  } as CSSProperties,

  payphoneContainer: {
    width: "100%",
    marginTop: 24,
    minHeight: 60,
  } as CSSProperties,

  // Estilos adicionales para loading y contenido del botón
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  } as CSSProperties,

  spinner: {
    width: 20,
    height: 20,
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as CSSProperties,

  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  } as CSSProperties,
};
