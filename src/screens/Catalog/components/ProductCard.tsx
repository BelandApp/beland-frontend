import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { productStyles } from "../styles";
import { Product } from "@services/core";
import {
  convertUSDToBeCoins,
  formatBeCoins,
  CURRENCY_CONFIG,
} from "../../../constants/currency";
import { Button } from "src/components";
import { CirclePlus } from "lucide-react-native";
import { colors } from "src/design-system";
import { borderTopWidth } from "html2canvas/dist/types/css/property-descriptors/border-width";

export type ProductCardType = Product;

export interface ProductCardProps {
  product: ProductCardType;
  onAddToCart: (product: ProductCardType) => void;
  isAdding?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  isAdding = false,
}) => {
  const image = (product as any).image_url || (product as any).image || "";
  const category =
    typeof (product as any).category === "object"
      ? (product as any).category.name
      : (product as any).category || "";
  const price = (product as any).price;

  return (
    <View
      style={[
        productStyles.productCard,
        product.stock < 1 && productStyles.noStock,
      ]}
      className="cursor-default"
    >
      <Text style={productStyles.productCategory}>{category}</Text>
      <View style={productStyles.productImageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={productStyles.productImage}
            resizeMode="contain"
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
      </View>

      <View style={{ flex: 1, width: "100%" }}>
        <Text style={productStyles.productBrand}>Productos Beland</Text>
        <Text style={productStyles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {product.stock > 0 ? (
          <View style={productStyles.productPriceRow}>
            <View style={{ flex: 1 }}>
              <Text style={productStyles.productPrice}>
                {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                {price}
              </Text>
              <Text style={productStyles.becoinsReference}>
                {formatBeCoins(convertUSDToBeCoins(price))}
              </Text>
            </View>

            <Button
              title="Añadir producto"
              onPress={() => onAddToCart(product)}
              disabled={isAdding}
              variant="onlyIcon"
              icon={<CirclePlus color={colors.brand.orange[500]} size={32} />}
              style={{ borderWidth: 0 }}
            />
          </View>
        ) : (
          <Text className="text-red-500 font-semibold text-sm text-center">
            Sin stock
          </Text>
        )}
      </View>
    </View>
  );
};
