/**
 * Utilidades para manejo de precios y descuentos
 */

export interface PriceCalculation {
  originalPrice: number;
  discount: number;
  hasDiscount: boolean;
  finalPrice: number;
  savings: number;
}

/**
 * Calcula el precio final aplicando descuento
 * @param resource Recurso con precio y descuento
 * @returns Objeto con todos los cálculos de precio
 */
export const calculateResourcePrice = (resource: {
  resource_price: number;
  resource_discount?: number;
}): PriceCalculation => {
  const originalPrice =
    typeof resource.resource_price === "number" ? resource.resource_price : 0;
  const discount =
    typeof resource.resource_discount === "number"
      ? resource.resource_discount
      : 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount
    ? originalPrice * (1 - discount / 100)
    : originalPrice;
  const savings = hasDiscount ? originalPrice - finalPrice : 0;

  return {
    originalPrice,
    discount,
    hasDiscount,
    finalPrice,
    savings,
  };
};

/**
 * Calcula el total de una compra con cantidad
 * @param resource Recurso con precio y descuento
 * @param quantity Cantidad a comprar
 * @returns Objeto con cálculos totales
 */
export const calculatePurchaseTotal = (
  resource: { resource_price: number; resource_discount?: number },
  quantity: number
) => {
  const priceCalc = calculateResourcePrice(resource);
  const totalOriginal = priceCalc.originalPrice * quantity;
  const totalFinal = priceCalc.finalPrice * quantity;
  const totalSavings = priceCalc.savings * quantity;

  return {
    ...priceCalc,
    quantity,
    totalOriginal,
    totalFinal,
    totalSavings,
  };
};
