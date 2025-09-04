import { CSSProperties } from "react";

export const presetAmountsStyles = {
  container: {
    marginBottom: window.innerWidth <= 768 ? 20 : 24,
    width: "100%",
    maxWidth: window.innerWidth <= 768 ? "100%" : 400,
    margin: window.innerWidth <= 768 ? "0 auto 20px auto" : "0 auto 24px auto",
  } as CSSProperties,

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14, // Aumentado de 12 a 14
    marginTop: 16,
  } as CSSProperties,

  presetButton: {
    padding: window.innerWidth <= 768 ? "14px 10px" : "18px 12px",
    borderRadius: 16,
    fontWeight: 600,
    fontSize: window.innerWidth <= 768 ? 15 : 17,
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "center" as const,
    minHeight: window.innerWidth <= 768 ? 50 : 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,

  presetButtonSelected: {
    background: "linear-gradient(135deg, #007AFF, #5856D6)",
    color: "#fff",
    border: "2px solid #007AFF",
    boxShadow: "0 4px 16px rgba(0, 122, 255, 0.3)",
    transform: "translateY(-2px)",
  } as CSSProperties,

  presetButtonUnselected: {
    background: "#fff",
    color: "#007AFF",
    border: "2px solid #e8f4fd",
    boxShadow: "0 2px 8px rgba(0, 122, 255, 0.05)",
  } as CSSProperties,

  presetButtonDisabled: {
    background: "#f5f5f7",
    color: "#8E8E93",
    border: "2px solid #e5e5ea",
    cursor: "not-allowed",
    opacity: 0.6,
  } as CSSProperties,
};
