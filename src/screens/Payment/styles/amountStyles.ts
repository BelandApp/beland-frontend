import { CSSProperties } from "react";

export const amountStyles = {
  amountContainer: {
    textAlign: "center" as const,
    marginBottom: window.innerWidth <= 768 ? 24 : 32,
    background:
      "linear-gradient(135deg, rgba(248, 251, 255, 0.8) 0%, rgba(240, 249, 255, 0.9) 100%)",
    borderRadius: window.innerWidth <= 768 ? 20 : 24,
    padding: window.innerWidth <= 768 ? "24px 16px" : "32px 24px",
    border: "1px solid rgba(0, 122, 255, 0.08)",
    position: "relative" as const,
    overflow: "hidden" as const,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow:
      "0 8px 32px rgba(0, 122, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  } as CSSProperties,

  amountInput: {
    fontSize: window.innerWidth <= 768 ? 36 : 48,
    fontWeight: 900,
    background: "linear-gradient(135deg, #007AFF, #5856D6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: 1,
    fontFamily: "inherit",
    border: "none",
    outline: "none",
    textAlign: "center" as const,
    width: "100%",
    appearance: "none" as const,
    MozAppearance: "textfield" as any,
    WebkitAppearance: "none" as const,
  } as CSSProperties,

  amountDisplay: {
    fontSize: window.innerWidth <= 768 ? 36 : 48,
    fontWeight: 800,
    background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-1px",
    fontFamily: "'SF Pro Display', 'Inter', sans-serif",
    textShadow: "0 4px 12px rgba(0, 122, 255, 0.15)",
    marginBottom: 8,
  } as CSSProperties,

  amountError: {
    fontSize: 13,
    color: "#FF3B30",
    marginTop: 8,
    fontWeight: 600,
  } as CSSProperties,

  freeEntryBadge: {
    fontSize: 18,
    color: "#34C759",
    fontWeight: 700,
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  } as CSSProperties,

  amountDivider: {
    margin: "16px auto 0 auto",
    width: "60%",
    height: 1,
    background: "linear-gradient(90deg, transparent, #e0e7ef, transparent)",
  } as CSSProperties,

  messageText: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 16,
    textAlign: "center" as const,
    maxWidth: 320,
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 1.4,
  } as CSSProperties,

  conversionInfo: {
    fontSize: 14,
    color: "#34C759",
    marginTop: 12,
    textAlign: "center" as const,
    fontWeight: 600,
    background: "rgba(52, 199, 89, 0.1)",
    padding: "8px 16px",
    borderRadius: 12,
    border: "1px solid rgba(52, 199, 89, 0.2)",
  } as CSSProperties,

  // Estilos adicionales para el PaymentScreen
  amountLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "#6B7280",
    marginBottom: 12,
    textAlign: "center" as const,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    opacity: 0.8,
  } as CSSProperties,

  originalAmount: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center" as const,
    marginBottom: 8,
  } as CSSProperties,

  strikethrough: {
    textDecoration: "line-through",
    opacity: 0.6,
  } as CSSProperties,

  currentAmount: {
    fontSize: 40,
    fontWeight: 700,
    background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textAlign: "center" as const,
    letterSpacing: "-1px",
    fontFamily: "'SF Pro Display', 'Inter', sans-serif",
  } as CSSProperties,

  freeLabel: {
    fontSize: 18,
    fontWeight: 700,
    color: "#34C759",
    textAlign: "center" as const,
    marginTop: 8,
    textShadow: "0 2px 8px rgba(52, 199, 89, 0.2)",
  } as CSSProperties,

  inputLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1D1D1F",
    marginBottom: 12,
  } as CSSProperties,

  input: {
    width: "100%",
    padding: "16px",
    fontSize: 18,
    border: "2px solid #E5E5E7",
    borderRadius: 12,
    outline: "none",
    textAlign: "center" as const,
    fontWeight: 600,
  } as CSSProperties,

  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 8,
    fontWeight: 500,
  } as CSSProperties,
};
