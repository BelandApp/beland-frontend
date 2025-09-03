import { CSSProperties } from "react";

export const headerStyles = {
  header: {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 255, 0.9) 100%)",
    backdropFilter: "blur(20px) saturate(1.8)",
    WebkitBackdropFilter: "blur(20px) saturate(1.8)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    borderRadius: "0 0 32px 32px",
    padding: "60px 24px 32px 24px",
    textAlign: "center" as const,
    marginBottom: 24,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.03)",
    position: "relative" as const,
    overflow: "hidden" as const,
  } as CSSProperties,

  commerceContainer: {
    position: "relative" as const,
    zIndex: 2,
  } as CSSProperties,

  commerceImage: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    margin: "0 auto 20px auto",
    background: "linear-gradient(135deg, #007AFF, #5856D6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 12px 32px rgba(0, 122, 255, 0.25), 0 4px 16px rgba(88, 86, 214, 0.15)",
    border: "3px solid rgba(255, 255, 255, 0.9)",
    position: "relative" as const,
    overflow: "hidden" as const,
  } as CSSProperties,

  commerceImageImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    borderRadius: "50%",
  } as CSSProperties,

  commerceName: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1D1D1F",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
    fontFamily: "'SF Pro Display', 'Inter', sans-serif",
  } as CSSProperties,

  commerceSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    margin: 0,
    fontWeight: 500,
    opacity: 0.8,
  } as CSSProperties,
};
