import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Resource } from "../../../types/resource";
import { gridStyles } from "../styles";
import { colors } from "../../../styles/colors";
import { calculateResourcePrice } from "../../../utils/priceHelpers";
import {
  convertBeCoinsToUSD,
  formatUSDPrice,
  formatBeCoins,
  CURRENCY_CONFIG,
} from "../../../constants/currency";

interface ResourcesGridProps {
  resources: Resource[];
  onPurchase: (resource: Resource) => void;
  loading?: boolean;
}

interface ResourceCardProps {
  resource: Resource;
  onPurchase: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPurchase,
}) => {
  // Usar la utilidad para calcular precios
  const priceCalc = calculateResourcePrice(resource);
  const quantity =
    typeof resource.resource_quanity === "number"
      ? resource.resource_quanity
      : 0;

  const isOutOfStock = quantity <= 0;

  return (
    <View style={gridStyles.resourceCard}>
      <View style={gridStyles.resourceImage}>
        {resource.resource_img ? (
          <Image
            source={{ uri: resource.resource_img }}
            style={{
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#F8F9FA",
            }}
          >
            <Text style={{ color: "#999", fontSize: 12 }}>Sin imagen</Text>
          </View>
        )}

        {/* Badge de descuento superpuesto en la imagen */}
        {priceCalc.hasDiscount && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: colors.belandOrange,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: colors.background,
              }}
            >
              {priceCalc.discount}% OFF
            </Text>
          </View>
        )}
      </View>

      <View style={gridStyles.resourceContent}>
        <Text style={gridStyles.resourceName} numberOfLines={2}>
          {resource.resource_name}
        </Text>

        <Text style={gridStyles.resourceDescription} numberOfLines={3}>
          {resource.resource_desc}
        </Text>

        {/* Sección de precios mejorada - USD principal, BeCoins referencia */}
        <View
          style={{
            marginBottom: 8,
            alignItems: Platform.OS === "web" ? "center" : "flex-start",
          }}
        >
          {priceCalc.hasDiscount ? (
            <View
              style={{
                flexDirection: "column",
                alignItems: Platform.OS === "web" ? "center" : "flex-start",
                backgroundColor: "rgba(255, 193, 7, 0.08)", // Fondo sutil dorado
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255, 193, 7, 0.2)",
                width: "100%",
                shadowColor: "#FFC107",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Header con badge de descuento */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    color: colors.textPrimary,
                  }}
                >
                  Precio Especial
                </Text>
                <View
                  style={{
                    backgroundColor: colors.belandOrange,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    -{priceCalc.discount}% OFF
                  </Text>
                </View>
              </View>

              {/* Precios comparativos */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                  marginBottom: 10,
                }}
              >
                {/* Precio original */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    Precio normal:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      textDecorationLine: "line-through",
                      fontWeight: "500",
                    }}
                  >
                    {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                    {formatUSDPrice(
                      convertBeCoinsToUSD(priceCalc.originalPrice)
                    )}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.textSecondary,
                      textDecorationLine: "line-through",
                      fontStyle: "italic",
                    }}
                  >
                    {formatBeCoins(priceCalc.originalPrice)}
                  </Text>
                </View>

                {/* Precio con descuento */}
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.primary,
                      marginBottom: 2,
                      fontWeight: "600",
                    }}
                  >
                    Tu precio:
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: colors.primary,
                    }}
                  >
                    {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                    {formatUSDPrice(convertBeCoinsToUSD(priceCalc.finalPrice))}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.primary,
                      fontStyle: "italic",
                      fontWeight: "500",
                    }}
                  >
                    {formatBeCoins(priceCalc.finalPrice)}
                  </Text>
                </View>
              </View>

              {/* Línea de ahorro destacada */}
              <View
                style={{
                  backgroundColor: colors.success,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  alignSelf: "stretch",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  🎉 ¡Ahorras {formatBeCoins(Math.round(priceCalc.savings))}!
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: "white",
                    opacity: 0.9,
                  }}
                >
                  ({CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                  {formatUSDPrice(convertBeCoinsToUSD(priceCalc.savings))})
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: "rgba(0, 0, 0, 0.03)",
                borderWidth: 1,
                borderColor: "rgba(0, 0, 0, 0.05)",
                width: "100%",
                alignItems: Platform.OS === "web" ? "center" : "flex-start",
              }}
            >
              {/* Header para precio regular */}
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  marginBottom: 6,
                  fontWeight: "500",
                }}
              >
                Precio regular
              </Text>

              {/* Precio principal en USD */}
              <Text
                style={{
                  marginBottom: 4,
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.primary,
                  textAlign: Platform.OS === "web" ? "center" : "left",
                }}
              >
                {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                {formatUSDPrice(convertBeCoinsToUSD(priceCalc.finalPrice))}
              </Text>

              {/* Precio en BeCoins como referencia */}
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontStyle: "italic",
                  textAlign: Platform.OS === "web" ? "center" : "left",
                  fontWeight: "500",
                }}
              >
                {formatBeCoins(priceCalc.finalPrice)}
              </Text>
            </View>
          )}
        </View>

        <Text style={gridStyles.resourceStock}>Stock: {quantity} unidades</Text>

        <TouchableOpacity
          style={[
            gridStyles.purchaseButton,
            isOutOfStock && gridStyles.purchaseButtonDisabled,
          ]}
          onPress={() => onPurchase(resource)}
          disabled={isOutOfStock}
        >
          <Text style={gridStyles.purchaseButtonText}>
            {isOutOfStock ? "Agotado" : "Comprar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ResourcesGrid: React.FC<ResourcesGridProps> = ({
  resources,
  onPurchase,
  loading = false,
}) => {
  const safeResources = Array.isArray(resources) ? resources : [];
  if (safeResources.length === 0 && !loading) {
    return (
      <View
        style={{
          padding: 40,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          No se encontraron recursos en esta categoría
        </Text>
      </View>
    );
  }

  return (
    <View style={gridStyles.container}>
      <View style={gridStyles.grid}>
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onPurchase={onPurchase}
          />
        ))}
      </View>
    </View>
  );
};
