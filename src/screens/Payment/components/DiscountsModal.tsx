import React from "react";
import { UserResource } from "../../../types/resource";

// Tipos locales para el modal
type Resource = {
  id: string;
  resource_name: string;
  resource_desc: string;
  resource_quanity: number;
  resource_discount: number;
};

type Redemption = {
  id: string;
  code: string;
  type: "DISCOUNT" | "BONUS_COINS" | "CIRCULARES";
  value: number;
  is_redeemed: boolean;
  expires_at?: string;
  description?: string;
};

// Estilos para cupones
const couponStyles = {
  couponCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    padding: window.innerWidth <= 768 ? 16 : 20,
    border: "1px solid rgba(230, 235, 240, 0.8)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  couponCardTraditional: {
    borderLeft: "4px solid #007AFF",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.98) 100%)",
  },
  couponCardUserResource: {
    borderLeft: "4px solid #34C759",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 255, 248, 0.98) 100%)",
  },
  couponCardApplied: {
    backgroundColor: "rgba(240, 249, 255, 0.98)",
    borderColor: "#007AFF",
    boxShadow:
      "0 8px 24px rgba(0, 122, 255, 0.15), 0 4px 12px rgba(0, 122, 255, 0.1)",
    transform: "translateY(-2px)",
  },
  couponContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start" as const,
    gap: window.innerWidth <= 768 ? 12 : 20,
    flexDirection:
      window.innerWidth <= 768 ? ("column" as const) : ("row" as const),
  },
  couponInfo: {
    flex: 1,
  },
  couponHeader: {
    fontSize: window.innerWidth <= 768 ? 16 : 18,
    fontWeight: 700,
    color: "#1D1D1F",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: window.innerWidth <= 768 ? 8 : 12,
    fontFamily: "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
    lineHeight: 1.3,
    flexWrap: "wrap" as const,
  },
  couponHeaderTraditional: {
    color: "#007AFF",
  },
  couponHeaderUserResource: {
    color: "#34C759",
  },
  couponBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 16,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    fontFamily: "'SF Pro Text', 'Inter', 'Roboto', sans-serif",
  },
  couponBadgeTraditional: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    color: "#007AFF",
    border: "1px solid rgba(0, 122, 255, 0.2)",
  },
  couponBadgeUserResource: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    color: "#34C759",
    border: "1px solid rgba(52, 199, 89, 0.2)",
  },
  couponDescription: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 1.5,
    fontFamily: "'SF Pro Text', 'Inter', 'Roboto', sans-serif",
  },
  couponValue: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    fontFamily: "'SF Pro Display', 'Inter', 'Roboto', sans-serif",
  },
  couponValueDiscount: {
    color: "#DC2626",
    background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  couponValueBonus: {
    color: "#059669",
    background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  couponMeta: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 6,
    fontFamily: "'SF Pro Text', 'Inter', 'Roboto', sans-serif",
    fontWeight: 500,
  },
  couponExpiry: {
    fontSize: 13,
    color: "#F59E0B",
    fontWeight: 600,
    fontFamily: "'SF Pro Text', 'Inter', 'Roboto', sans-serif",
  },
  couponButton: {
    padding: window.innerWidth <= 768 ? "10px 16px" : "12px 20px",
    borderRadius: 16,
    fontSize: window.innerWidth <= 768 ? 13 : 14,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    minWidth: window.innerWidth <= 768 ? 80 : 100,
    textAlign: "center" as const,
    fontFamily: "'SF Pro Text', 'Inter', 'Roboto', sans-serif",
    letterSpacing: "0.3px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    alignSelf: window.innerWidth <= 768 ? "flex-start" : "auto",
  },
  couponButtonUse: {
    background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 122, 255, 0.3)",
  },
  couponButtonUserResource: {
    background: "linear-gradient(135deg, #34C759 0%, #30A46C 100%)",
    color: "white",
    boxShadow: "0 4px 16px rgba(52, 199, 89, 0.3)",
  },
  couponButtonApplied: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    color: "#34C759",
    cursor: "default",
    border: "2px solid rgba(52, 199, 89, 0.3)",
    boxShadow: "none",
  },
  couponButtonDisabled: {
    backgroundColor: "#F9FAFB",
    color: "#D1D5DB",
    cursor: "not-allowed",
    border: "1px solid #E5E7EB",
    boxShadow: "none",
  },
  couponImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    objectFit: "cover" as const,
    border: "2px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
};

interface DiscountsModalProps {
  isVisible: boolean;
  onClose: () => void;
  paymentDataResource?: Resource[];
  paymentDataRedemptions?: Redemption[];
  userResources?: UserResource[];
  appliedRedemption?: Redemption | UserResource | null;
  onApplyRedemption: (redemption: Redemption | UserResource) => void;
}

export const DiscountsModal: React.FC<DiscountsModalProps> = ({
  isVisible,
  onClose,
  paymentDataResource = [],
  paymentDataRedemptions = [],
  userResources = [],
  appliedRedemption,
  onApplyRedemption,
}) => {
  if (!isVisible) return null;

  const totalDiscounts =
    (paymentDataResource?.length || 0) +
    (paymentDataRedemptions?.length || 0) +
    (userResources?.length || 0);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        zIndex: 1000,
        padding: "0",
        overflow: "hidden",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          borderRadius: window.innerWidth <= 768 ? "24px 24px 0 0" : 24,
          padding: window.innerWidth <= 768 ? "24px 20px" : 32,
          maxWidth: window.innerWidth <= 768 ? "100%" : 720,
          width: window.innerWidth <= 768 ? "100%" : "auto",
          height: window.innerWidth <= 768 ? "100%" : "auto",
          maxHeight: window.innerWidth <= 768 ? "100%" : "85%",
          overflowY: "auto",
          minWidth: window.innerWidth <= 768 ? "auto" : 550,
          marginTop: window.innerWidth <= 768 ? "0" : "20px",
          boxShadow:
            "0 25px 50px rgba(0, 0, 0, 0.25), 0 10px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          fontFamily:
            "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: window.innerWidth <= 768 ? 20 : 28,
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            paddingBottom: window.innerWidth <= 768 ? 16 : 20,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: window.innerWidth <= 768 ? 22 : 28,
                fontWeight: 700,
                fontFamily:
                  "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
                background:
                  "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Descuentos disponibles
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: window.innerWidth <= 768 ? 14 : 16,
                color: "#64748b",
                fontFamily:
                  "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              {totalDiscounts} descuentos encontrados
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: window.innerWidth <= 768 ? 24 : 28,
              cursor: "pointer",
              color: "#64748b",
              padding: 8,
              borderRadius: 12,
              width: window.innerWidth <= 768 ? 36 : 44,
              height: window.innerWidth <= 768 ? 36 : 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(100, 116, 139, 0.1)";
              e.currentTarget.style.color = "#475569";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            ×
          </button>
        </div>

        {/* Recursos disponibles */}
        {Array.isArray(paymentDataResource) &&
          paymentDataResource.length > 0 && (
            <div style={{ marginBottom: window.innerWidth <= 768 ? 24 : 32 }}>
              <div
                style={{
                  fontSize: window.innerWidth <= 768 ? 18 : 20,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: window.innerWidth <= 768 ? 16 : 20,
                  fontFamily:
                    "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                  borderLeft: "4px solid #007AFF",
                  paddingLeft: 16,
                  background:
                    "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Recursos disponibles
              </div>
              {paymentDataResource.map((res: Resource) => (
                <div
                  key={res.id}
                  style={{
                    ...couponStyles.couponCard,
                    ...couponStyles.couponCardTraditional,
                    marginBottom: 16,
                  }}
                  className="coupon-card"
                >
                  <div style={couponStyles.couponContent}>
                    <div style={couponStyles.couponInfo}>
                      <div
                        style={{
                          ...couponStyles.couponHeader,
                          ...couponStyles.couponHeaderTraditional,
                        }}
                      >
                        {res.resource_name}
                      </div>
                      {res.resource_desc && (
                        <div style={couponStyles.couponDescription}>
                          {res.resource_desc}
                        </div>
                      )}
                      <div style={couponStyles.couponMeta}>
                        Cantidad: {res.resource_quanity}
                      </div>
                      <div style={couponStyles.couponValue}>
                        <span style={couponStyles.couponValueDiscount}>
                          {res.resource_discount}% de descuento
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Cupones disponibles */}
        {Array.isArray(paymentDataRedemptions) &&
          paymentDataRedemptions.length > 0 && (
            <div style={{ marginBottom: window.innerWidth <= 768 ? 24 : 32 }}>
              <div
                style={{
                  fontSize: window.innerWidth <= 768 ? 18 : 20,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: window.innerWidth <= 768 ? 16 : 20,
                  fontFamily:
                    "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                  borderLeft: "4px solid #f59e0b",
                  paddingLeft: 16,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Cupones disponibles
              </div>
              {paymentDataRedemptions.map((redemption: Redemption) => (
                <div
                  key={redemption.id}
                  className="coupon-card"
                  style={{
                    ...couponStyles.couponCard,
                    ...couponStyles.couponCardTraditional,
                    ...(appliedRedemption?.id === redemption.id
                      ? couponStyles.couponCardApplied
                      : {}),
                    marginBottom: 16,
                  }}
                >
                  <div style={couponStyles.couponContent}>
                    <div style={couponStyles.couponInfo}>
                      <div
                        style={{
                          ...couponStyles.couponHeader,
                          ...couponStyles.couponHeaderTraditional,
                        }}
                      >
                        {redemption.code}
                        <div
                          style={{
                            ...couponStyles.couponBadge,
                            ...couponStyles.couponBadgeTraditional,
                          }}
                        >
                          Cupón
                        </div>
                      </div>
                      {redemption.description && (
                        <div style={couponStyles.couponDescription}>
                          {redemption.description}
                        </div>
                      )}
                      <div style={couponStyles.couponValue}>
                        {redemption.type === "DISCOUNT" && (
                          <span style={couponStyles.couponValueDiscount}>
                            {redemption.value}% de descuento
                          </span>
                        )}
                        {redemption.type === "BONUS_COINS" && (
                          <span style={couponStyles.couponValueBonus}>
                            +{redemption.value} BeCoins
                          </span>
                        )}
                        {redemption.type === "CIRCULARES" && (
                          <span style={couponStyles.couponValueBonus}>
                            {redemption.value} recursos circulares
                          </span>
                        )}
                      </div>
                      {redemption.expires_at && (
                        <div style={couponStyles.couponExpiry}>
                          Expira:{" "}
                          {new Date(redemption.expires_at).toLocaleDateString(
                            "es-EC"
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onApplyRedemption(redemption)}
                      disabled={redemption.is_redeemed}
                      style={{
                        ...couponStyles.couponButton,
                        ...(appliedRedemption?.id === redemption.id
                          ? couponStyles.couponButtonApplied
                          : redemption.is_redeemed
                          ? couponStyles.couponButtonDisabled
                          : couponStyles.couponButtonUse),
                      }}
                    >
                      {appliedRedemption?.id === redemption.id
                        ? "Aplicado ✓"
                        : redemption.is_redeemed
                        ? "Usado"
                        : "Usar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Mis descuentos y promociones */}
        {Array.isArray(userResources) && userResources.length > 0 && (
          <div style={{ marginBottom: window.innerWidth <= 768 ? 24 : 32 }}>
            <div
              style={{
                fontSize: window.innerWidth <= 768 ? 18 : 20,
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: window.innerWidth <= 768 ? 16 : 20,
                fontFamily:
                  "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                borderLeft: "4px solid #34C759",
                paddingLeft: 16,
                background: "linear-gradient(135deg, #34C759 0%, #30a46c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Mis descuentos y promociones
            </div>
            {userResources.map((userResource: UserResource) => {
              const availableQuantity =
                userResource.quantity - userResource.quantity_redeemed;
              const hasValidDiscount =
                userResource.resource &&
                userResource.resource.discount &&
                userResource.resource.discount > 0;

              if (
                !hasValidDiscount ||
                availableQuantity <= 0 ||
                !userResource.resource
              )
                return null;

              return (
                <div
                  key={userResource.id}
                  className="coupon-card"
                  style={{
                    ...couponStyles.couponCard,
                    ...couponStyles.couponCardUserResource,
                    ...(appliedRedemption?.id === userResource.id
                      ? couponStyles.couponCardApplied
                      : {}),
                    marginBottom: 16,
                  }}
                >
                  <div style={couponStyles.couponContent}>
                    <div style={couponStyles.couponInfo}>
                      <div
                        style={{
                          ...couponStyles.couponHeader,
                          ...couponStyles.couponHeaderUserResource,
                        }}
                      >
                        {userResource.resource.name}
                        <div
                          style={{
                            ...couponStyles.couponBadge,
                            ...couponStyles.couponBadgeUserResource,
                          }}
                        >
                          Mi descuento
                        </div>
                        {userResource.resource.url_image && (
                          <img
                            src={userResource.resource.url_image}
                            alt={userResource.resource.name}
                            style={couponStyles.couponImage}
                          />
                        )}
                      </div>
                      {userResource.resource.description && (
                        <div style={couponStyles.couponDescription}>
                          {userResource.resource.description}
                        </div>
                      )}
                      <div style={couponStyles.couponValue}>
                        <span style={couponStyles.couponValueDiscount}>
                          {userResource.resource.discount}% de descuento
                        </span>
                      </div>
                      <div style={couponStyles.couponMeta}>
                        Disponibles: {availableQuantity} de{" "}
                        {userResource.quantity}
                      </div>
                      {userResource.resource.expires_at && (
                        <div style={couponStyles.couponExpiry}>
                          Expira:{" "}
                          {new Date(
                            userResource.resource.expires_at
                          ).toLocaleDateString("es-EC")}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onApplyRedemption(userResource)}
                      disabled={
                        userResource.is_redeemed || availableQuantity <= 0
                      }
                      style={{
                        ...couponStyles.couponButton,
                        ...(appliedRedemption?.id === userResource.id
                          ? couponStyles.couponButtonApplied
                          : userResource.is_redeemed || availableQuantity <= 0
                          ? couponStyles.couponButtonDisabled
                          : couponStyles.couponButtonUserResource),
                      }}
                    >
                      {appliedRedemption?.id === userResource.id
                        ? "Aplicado ✓"
                        : userResource.is_redeemed || availableQuantity <= 0
                        ? "No disponible"
                        : "Usar descuento"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sin descuentos */}
        {totalDiscounts === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: window.innerWidth <= 768 ? "40px 20px" : "60px 40px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)",
              border: "1px solid rgba(226, 232, 240, 0.5)",
            }}
          >
            <div
              style={{
                fontSize: window.innerWidth <= 768 ? 48 : 64,
                marginBottom: window.innerWidth <= 768 ? 16 : 20,
                filter: "grayscale(0.3)",
              }}
            >
              🎟️
            </div>
            <div
              style={{
                fontSize: window.innerWidth <= 768 ? 18 : 22,
                fontWeight: 700,
                marginBottom: window.innerWidth <= 768 ? 8 : 12,
                color: "#475569",
                fontFamily:
                  "'SF Pro Display', 'Inter', 'Roboto', 'Segoe UI', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              No hay descuentos disponibles
            </div>
            <div
              style={{
                fontSize: window.innerWidth <= 768 ? 14 : 16,
                color: "#64748b",
                lineHeight: 1.5,
                fontFamily: "'SF Pro Text', 'Inter', 'Roboto', sans-serif",
              }}
            >
              Los descuentos aparecerán aquí cuando estén disponibles
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountsModal;
