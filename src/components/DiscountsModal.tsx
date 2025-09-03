import React from "react";
import { UserResource } from "../types/resource";
import { commonStyles } from "../styles";

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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    border: "1px solid #E5E5E7",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  couponCardTraditional: {
    borderLeft: "4px solid #007AFF",
  },
  couponCardUserResource: {
    borderLeft: "4px solid #34C759",
  },
  couponCardApplied: {
    backgroundColor: "#F0F9FF",
    borderColor: "#007AFF",
    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.15)",
  },
  couponContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  couponInfo: {
    flex: 1,
  },
  couponHeader: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1D1D1F",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  couponHeaderTraditional: {
    color: "#007AFF",
  },
  couponHeaderUserResource: {
    color: "#34C759",
  },
  couponBadge: {
    fontSize: 10,
    fontWeight: 500,
    padding: "4px 8px",
    borderRadius: 12,
    textTransform: "uppercase" as const,
  },
  couponBadgeTraditional: {
    backgroundColor: "#E3F2FF",
    color: "#007AFF",
  },
  couponBadgeUserResource: {
    backgroundColor: "#E8F5E8",
    color: "#34C759",
  },
  couponDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 1.4,
  },
  couponValue: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },
  couponValueDiscount: {
    color: "#FF3B30",
  },
  couponValueBonus: {
    color: "#34C759",
  },
  couponMeta: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  couponExpiry: {
    fontSize: 12,
    color: "#FF9500",
  },
  couponButton: {
    padding: "10px 16px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: 80,
    textAlign: "center" as const,
  },
  couponButtonUse: {
    backgroundColor: "#007AFF",
    color: "white",
  },
  couponButtonUserResource: {
    backgroundColor: "#34C759",
    color: "white",
  },
  couponButtonApplied: {
    backgroundColor: "#E8F5E8",
    color: "#34C759",
    cursor: "default",
  },
  couponButtonDisabled: {
    backgroundColor: "#F2F2F7",
    color: "#8E8E93",
    cursor: "not-allowed",
  },
  couponImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    objectFit: "cover" as const,
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
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 24,
          maxWidth: "90%",
          maxHeight: "80%",
          overflowY: "auto",
          minWidth: 350,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            borderBottom: "1px solid #E5E5E7",
            paddingBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                color: "#1D1D1F",
              }}
            >
              Descuentos disponibles
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: 14,
                color: "#666",
                opacity: 0.8,
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
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
              padding: 4,
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Recursos disponibles */}
        {Array.isArray(paymentDataResource) &&
          paymentDataResource.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#007AFF",
                  marginBottom: 16,
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
                    marginBottom: 12,
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
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#007AFF",
                  marginBottom: 16,
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
                    marginBottom: 12,
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
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "#007AFF",
                marginBottom: 16,
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
                    marginBottom: 12,
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
              padding: "40px 20px",
              color: "#666",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              No hay descuentos disponibles
            </div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Los descuentos aparecerán aquí cuando estén disponibles
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountsModal;
