import { CSSProperties } from "react";

export const containerStyles = {
  container: {
    height: "100vh",
    fontFamily: "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
    background:
      "linear-gradient(135deg, #f8fbff 0%, #f0f9ff 50%, #e3f2fd 100%)",
    overflow: "hidden" as const,
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as CSSProperties,

  scrollContainer: {
    height: "100vh",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    WebkitOverflowScrolling: "touch" as any,
    scrollBehavior: "smooth" as const,
  } as CSSProperties,

  content: {
    maxWidth: 640,
    width: "100%",
    margin: "0 auto",
    padding: "20px 24px 120px 24px",
    minHeight: "calc(100vh - 40px)",
  } as CSSProperties,

  card: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.04)",
    padding: 40,
    margin: "16px 0",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px) saturate(1.8)",
    WebkitBackdropFilter: "blur(20px) saturate(1.8)",
  } as CSSProperties,

  sectionCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)",
    padding: 28,
    marginBottom: 20,
    border: "1px solid rgba(240, 244, 248, 0.8)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  } as CSSProperties,

  gradientCard: {
    background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    color: "white",
    boxShadow:
      "0 12px 32px rgba(0, 122, 255, 0.3), 0 4px 16px rgba(88, 86, 214, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  } as CSSProperties,
};
