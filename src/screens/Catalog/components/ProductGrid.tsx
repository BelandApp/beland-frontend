import React from "react";
import { View, Text } from "react-native";
import { productStyles } from "../styles";
import { ProductCard, ProductCardType } from "./ProductCard";

export interface ProductGridProps {
  products: ProductCardType[];
  onAddToCart: (product: ProductCardType) => void;
  addingProductId?: string | null;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  addingProductId,
}) => {
  if (products.length === 0) {
    return (
      <View style={productStyles.emptyState}>
        <Text style={productStyles.emptyStateText}>
          No se encontraron productos con los filtros aplicados
        </Text>
      </View>
    );
  }

  return (
    <View style={productStyles.productGrid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            isAdding={addingProductId === product.id}
          />
        ))}

    </View>
  );
};
