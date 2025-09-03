import { CSSProperties } from "react";

export const couponStyles = {
  sectionContainer: {
    marginBottom: 24,
  } as CSSProperties,

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1D1D1F",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 12,
    letterSpacing: -0.5,
  } as CSSProperties,

  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    background: "linear-gradient(135deg, #007AFF, #5856D6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: 12,
    fontWeight: 700,
  } as CSSProperties,

  loadingCard: {
    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
    borderRadius: 16,
    padding: "16px 20px",
    marginBottom: 12,
    border: "2px solid #e0f2fe",
    color: "#007AFF",
    textAlign: "center" as const,
    fontSize: 14,
    fontWeight: 500,
  } as CSSProperties,

  errorCard: {
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    borderRadius: 16,
    padding: "16px 20px",
    marginBottom: 12,
    border: "2px solid #fecaca",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 500,
  } as CSSProperties,

  couponCard: {
    borderRadius: 20,
    padding: "24px", // Simplificado para móviles
    marginBottom: 20, // Aumentado de 16 a 20
    border: "2px solid transparent",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
    overflow: "hidden" as const,
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  } as CSSProperties,

  couponCardTraditional: {
    borderLeft: "4px solid #F59E0B",
    background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
  } as CSSProperties,

  couponCardUserResource: {
    borderLeft: "4px solid #10B981",
    background: "linear-gradient(135deg, #F0FDF4, #D1FAE5)",
  } as CSSProperties,

  couponCardApplied: {
    background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
    borderLeft: "4px solid #10B981",
    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.15)",
    transform: "translateY(-2px)",
  } as CSSProperties,

  couponContent: {
    display: "flex",
    flexDirection: "column" as const, // Cambio a columna para móviles
    gap: 16,
  } as CSSProperties,

  couponInfo: {
    flex: 1,
    marginBottom: 8, // Espacio antes del botón en móviles
  } as CSSProperties,

  couponHeader: {
    fontWeight: 700,
    fontSize: 17, // Aumentado de 16 a 17
    marginBottom: 10, // Aumentado de 8 a 10
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap" as const, // Para que los badges se ajusten en móviles
    gap: 12,
    letterSpacing: -0.3,
  } as CSSProperties,

  couponHeaderTraditional: {
    color: "#B45309",
  } as CSSProperties,

  couponHeaderUserResource: {
    color: "#047857",
  } as CSSProperties,

  couponBadge: {
    background: "rgba(0, 0, 0, 0.1)",
    color: "#6B7280",
    fontSize: 10,
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: 6,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  } as CSSProperties,

  couponBadgeTraditional: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#B45309",
  } as CSSProperties,

  couponBadgeUserResource: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "#047857",
  } as CSSProperties,

  couponImage: {
    width: 24,
    height: 24,
    borderRadius: 6,
    objectFit: "cover" as const,
  } as CSSProperties,

  couponDescription: {
    color: "#6B7280",
    fontSize: 14, // Aumentado de 13 a 14
    marginBottom: 8, // Aumentado de 6 a 8
    lineHeight: 1.4, // Aumentado de 1.3 a 1.4
  } as CSSProperties,

  couponValue: {
    fontSize: 16, // Aumentado de 15 a 16
    fontWeight: 700,
    marginBottom: 10, // Aumentado de 6 a 10
    display: "flex",
    alignItems: "center",
    gap: 8,
  } as CSSProperties,

  couponValueDiscount: {
    color: "#047857",
    background: "rgba(16, 185, 129, 0.15)", // Aumentado opacity de 0.1 a 0.15
    padding: "6px 14px", // Aumentado padding
    borderRadius: 10, // Aumentado de 8 a 10
    fontSize: 15, // Aumentado de 14 a 15
    fontWeight: 600,
  } as CSSProperties,

  couponValueBonus: {
    color: "#1D4ED8",
    background: "rgba(29, 78, 216, 0.15)", // Aumentado opacity
    padding: "6px 14px", // Aumentado padding
    borderRadius: 10, // Aumentado de 8 a 10
    fontSize: 15, // Aumentado de 14 a 15
    fontWeight: 600,
  } as CSSProperties,

  couponMeta: {
    fontSize: 13, // Aumentado de 12 a 13
    color: "#9CA3AF",
    marginBottom: 4, // Aumentado de 2 a 4
  } as CSSProperties,

  couponExpiry: {
    fontSize: 12, // Aumentado de 11 a 12
    color: "#6B7280",
  } as CSSProperties,

  couponButton: {
    border: "none",
    borderRadius: 14, // Aumentado de 12 a 14
    padding: "14px 28px", // Aumentado padding
    fontSize: 15, // Aumentado de 14 a 15
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    minWidth: 120, // Aumentado de 100 a 120
    textAlign: "center" as const,
    letterSpacing: -0.2,
    textTransform: "none" as const,
    alignSelf: "flex-start" as const, // Para que no se estire en móviles
  } as CSSProperties,

  couponButtonUse: {
    background: "linear-gradient(135deg, #F59E0B, #D97706)",
    color: "white",
    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.25)",
  } as CSSProperties,

  couponButtonUserResource: {
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "white",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
  } as CSSProperties,

  couponButtonApplied: {
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "white",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
  } as CSSProperties,

  couponButtonDisabled: {
    background: "#F3F4F6",
    color: "#9CA3AF",
    cursor: "not-allowed",
    boxShadow: "none",
  } as CSSProperties,
};
