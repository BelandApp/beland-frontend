import { CSSProperties } from "react";

export const methodSelectorStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    marginBottom: window.innerWidth <= 768 ? 24 : 32,
    gap: 0,
    background: "#f7fafd",
    borderRadius: 20,
    border: "2px solid #e8f4fd",
    width: "100%",
    maxWidth: window.innerWidth <= 768 ? "100%" : 400,
    overflow: "hidden" as const,
    margin: window.innerWidth <= 768 ? "0 auto 24px auto" : "0 auto 32px auto",
    boxShadow: "0 4px 16px rgba(0, 122, 255, 0.08)",
  } as CSSProperties,

  methodButton: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: window.innerWidth <= 768 ? "18px 16px" : "22px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: window.innerWidth <= 768 ? 10 : 14,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: window.innerWidth <= 768 ? 15 : 17,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
  } as CSSProperties,

  methodButtonActive: {
    background: "#fff",
    color: "#007AFF",
    boxShadow: "0 4px 16px rgba(0, 122, 255, 0.15)",
    transform: "translateY(-1px)",
  } as CSSProperties,

  methodButtonInactive: {
    background: "#f7fafd",
    color: "#8E8E93",
  } as CSSProperties,

  methodIcon: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,

  methodText: {
    fontWeight: 700,
    fontSize: 16,
  } as CSSProperties,
};
