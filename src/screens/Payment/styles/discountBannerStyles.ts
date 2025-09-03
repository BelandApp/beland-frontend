import { CSSProperties } from "react";

export const discountBannerStyles = {
  banner: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    borderRadius: 16,
    padding: "16px 20px",
    marginBottom: 24,
    color: "white",
    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
    position: "relative" as const,
    overflow: "hidden" as const,
  } as CSSProperties,

  bannerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  } as CSSProperties,

  bannerInfo: {
    flex: 1,
  } as CSSProperties,

  bannerTitle: {
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: -0.3,
  } as CSSProperties,

  bannerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
  } as CSSProperties,

  bannerSubtitle: {
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 4,
  } as CSSProperties,

  bannerAmounts: {
    textAlign: "right" as const,
  } as CSSProperties,

  bannerOriginalAmount: {
    fontSize: 12,
    opacity: 0.8,
    textDecoration: "line-through",
    marginBottom: 2,
  } as CSSProperties,

  bannerNewAmount: {
    fontWeight: 700,
    fontSize: 16,
  } as CSSProperties,

  bannerFreeTag: {
    fontSize: 18,
    fontWeight: 900,
    background: "rgba(255, 255, 255, 0.2)",
    padding: "4px 12px",
    borderRadius: 8,
    backdropFilter: "blur(10px)",
  } as CSSProperties,

  bannerDecorator: {
    position: "absolute" as const,
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    filter: "blur(20px)",
  } as CSSProperties,
};
