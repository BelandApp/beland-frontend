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
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  unit_becoin?: number;
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
    CART: "carts/user",
    CART_ITEMS: "cart-items",
    CART_SUMMARY: "carts/summary",
    APPLY_COUPON: "carts/coupon",
    REMOVE_COUPON: "carts/coupon",
    CLEAR_CART: "carts/clear",
    SYNC_CART: "carts/sync",
  } as const;

  /**
   * Get current user's cart with all items
   */
  async getCart(): Promise<Cart> {
    return this.get<Cart>(this.ENDPOINTS.CART);
  }

  /**
   * Create a new cart for user
   */
  async createCart(data: { user_id: string }): Promise<Cart> {
    return this.post<Cart>("carts", data);
  }

  /**
   * Get product information by ID
   */
  async getProduct(productId: string): Promise<Product> {
    return this.get<Product>(`products/${productId}`);
  }

  /**
   * Get current user ID from authentication context
   */
  private async getCurrentUserId(): Promise<string> {
    // Get user info from auth context or make a request to get current user
    const userInfo = await this.get<{ id: string; email: string }>("auth/me");
    return userInfo.id;
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
  async addToCart(data: {
    product_id: string;
    quantity: number;
  }): Promise<CartItem> {
    // 1. Get or create user cart
    let cart: Cart;
    try {
      cart = await this.getCart();
    } catch (error) {
      // If no cart exists, create one
      const userId = await this.getCurrentUserId();
      cart = await this.createCart({ user_id: userId });
    }

    // 2. Get product information to obtain price
    const product = await this.getProduct(data.product_id);

    // 3. Create the cart item with all required fields
    const cartItemData: AddToCartDto = {
      cart_id: cart.id,
      product_id: data.product_id,
      quantity: data.quantity,
      unit_price: product.price,
      unit_becoin: product.price_becoin,
    };

    return this.post<CartItem>(this.ENDPOINTS.CART_ITEMS, cartItemData);
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
   * Note: Backend doesn't have sync endpoint, so we just return current cart
   */
  async syncCart(localCartItems: Omit<AddToCartDto, "id">[]): Promise<Cart> {
    // TODO: Implement proper sync when backend supports it
    // For now, just return the current cart
    return this.getCart();
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
