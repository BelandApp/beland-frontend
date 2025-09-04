import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { productStyles } from "../styles";
import { Product } from "../../../types/Products";
import { CartProduct } from "../../../stores/useCartStore";

export type ProductCardType = Product | CartProduct;

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
  // Soporta Product (backend) o CartProduct (carrito)
  const image = (product as any).image_url || (product as any).image || "";
  const category =
    typeof (product as any).category === "object"
      ? (product as any).category.name
      : (product as any).category || "";
  const price = (product as any).price;
  return (
    <View style={productStyles.productCard}>
      <View style={productStyles.productImageContainer}>
        <Image
          source={{ uri: image }}
          style={productStyles.productImage}
          resizeMode="cover"
        />
      </View>
      <Text style={productStyles.productBrand}>Productos Beland</Text>
      <Text style={productStyles.productName}>{product.name}</Text>
      <Text style={productStyles.productCategory}>{category}</Text>
      <View style={productStyles.productPriceRow}>
        <Text style={productStyles.productPrice}>${price}</Text>
        <TouchableOpacity
          style={[
            productStyles.addToCartButton,
            isAdding && productStyles.addToCartButtonLoading,
          ]}
          onPress={() => onAddToCart(product)}
          disabled={isAdding}
        >
          <Text style={productStyles.addToCartText}>
            {isAdding ? "⟳" : "+"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
