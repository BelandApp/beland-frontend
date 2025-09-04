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

        {/* Sección de precios mejorada */}
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
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textDecorationLine: "line-through",
                  marginBottom: 2,
                }}
              >
                {priceCalc.originalPrice.toFixed(0)} BeCoins
              </Text>
              <Text style={[gridStyles.resourcePrice, { marginBottom: 0 }]}>
                {priceCalc.finalPrice.toFixed(0)} BeCoins
              </Text>
            </View>
          ) : (
            <Text style={[gridStyles.resourcePrice, { marginBottom: 0 }]}>
              {priceCalc.finalPrice.toFixed(0)} BeCoins
            </Text>
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
