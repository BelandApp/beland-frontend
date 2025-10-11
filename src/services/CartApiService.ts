/**
 * Cart Service - Consolidated shopping cart operations
 * Handles cart management, items, and checkout preparation
 */

import { CoreApiService } from "./core/ApiService";
import { Product } from "./ProductApiService";

// Cart Types
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartDto {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface ApplyCouponDto {
  coupon_code: string;
}

export interface CouponInfo {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_amount?: number;
  is_valid: boolean;
  discount_amount: number;
}

export interface CartSummary {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  applied_coupon?: CouponInfo;
}

class CartServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    CART: "cart",
    CART_ITEMS: "cart/items",
    CART_SUMMARY: "cart/summary",
    APPLY_COUPON: "cart/coupon",
    REMOVE_COUPON: "cart/coupon",
    CLEAR_CART: "cart/clear",
    SYNC_CART: "cart/sync",
  } as const;

  /**
   * Get current user's cart with all items
   */
  async getCart(): Promise<Cart> {
    return this.get<Cart>(this.ENDPOINTS.CART);
  }

  /**
   * Get cart summary (totals, taxes, discounts)
   */
  async getCartSummary(): Promise<CartSummary> {
    return this.get<CartSummary>(this.ENDPOINTS.CART_SUMMARY);
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartDto): Promise<CartItem> {
    return this.post<CartItem>(this.ENDPOINTS.CART_ITEMS, data);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    itemId: string,
    data: UpdateCartItemDto
  ): Promise<CartItem> {
    return this.patch<CartItem>(`${this.ENDPOINTS.CART_ITEMS}/${itemId}`, data);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.CART_ITEMS}/${itemId}`
    );
  }

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(this.ENDPOINTS.CLEAR_CART);
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(data: ApplyCouponDto): Promise<{
    success: boolean;
    coupon: CouponInfo;
    cart_summary: CartSummary;
  }> {
    return this.post(`${this.ENDPOINTS.APPLY_COUPON}`, data);
  }

  /**
   * Remove applied coupon from cart
   */
  async removeCoupon(): Promise<{
    success: boolean;
    cart_summary: CartSummary;
  }> {
    return this.delete(`${this.ENDPOINTS.REMOVE_COUPON}`);
  }

  /**
   * Validate coupon without applying it
   */
  async validateCoupon(couponCode: string): Promise<{
    is_valid: boolean;
    coupon?: CouponInfo;
    message?: string;
  }> {
    return this.post("coupons/validate", { code: couponCode });
  }

  /**
   * Sync cart with server (useful for offline/online sync)
   */
  async syncCart(localCartItems: Omit<AddToCartDto, "id">[]): Promise<Cart> {
    return this.post<Cart>(this.ENDPOINTS.SYNC_CART, { items: localCartItems });
  }

  /**
   * Get recommended products based on cart contents
   */
  async getRecommendations(limit: number = 5): Promise<Product[]> {
    return this.get<Product[]>(`cart/recommendations?limit=${limit}`);
  }

  /**
   * Check if cart items are still available and prices are current
   */
  async validateCart(): Promise<{
    is_valid: boolean;
    issues: {
      type: "out_of_stock" | "price_change" | "unavailable";
      item_id: string;
      product_name: string;
      message: string;
    }[];
    updated_cart?: Cart;
  }> {
    return this.post("cart/validate");
  }

  /**
   * Quick add multiple items to cart
   */
  async addMultipleItems(items: AddToCartDto[]): Promise<{
    success: boolean;
    added_items: CartItem[];
    failed_items: { product_id: string; reason: string }[];
    cart: Cart;
  }> {
    return this.post("cart/bulk-add", { items });
  }

  /**
   * Get cart item count (lightweight endpoint)
   */
  async getCartItemCount(): Promise<{ count: number }> {
    return this.get<{ count: number }>("cart/count");
  }

  /**
   * Estimate shipping cost for current cart
   */
  async estimateShipping(data: {
    address_id?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  }): Promise<{
    shipping_options: {
      id: string;
      name: string;
      price: number;
      estimated_days: number;
    }[];
  }> {
    return this.post("cart/shipping-estimate", data);
  }
}

// Export singleton instance
export const CartService = new CartServiceClass();
