/**
 * Cart Service - Consolidated shopping cart operations
 * Handles cart management, items, and checkout preparation
 */

import { Product } from "src/types";
import { CoreApiService } from "../core/ApiService";

// Cart Types
export interface CartItem {
  id: string;
  cart_id: string;
  product: Product;
  product_id: string;
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
    CLEAR_CART: "carts/clean",
    SYNC_CART: "carts/sync",
    CART_ADDRESS: "carts/address",
    CART_ITEMS: "cart-items",
  } as const;

  /**
   * Get current user's cart with all items
   */
  async getCart(): Promise<Cart> {
    return this.get<Cart>(this.ENDPOINTS.CART);
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
   * Add item to cart
   */
  async addToCart(data: {
    product_id: string;
    quantity: number;
  }): Promise<CartItem> {
    // 1. Get or create user cart

    const cart = await this.getCart();
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

  // ! NOT WORKING ON BACKEND
  /**
   * Update cart item quantity
   */
  async updateCartItem(
    itemId: string,
    data: UpdateCartItemDto
  ): Promise<CartItem> {
    return this.put<CartItem>(
      `${this.ENDPOINTS.CART_ITEMS}/${itemId}`,
      data
    );
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
    const cart = await this.getCart();
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.CLEAR_CART}/${cart.id}`
    );
  }

  async syncCart(localCartItems: Omit<AddToCartDto, "id">[]): Promise<Cart> {
    // TODO: Implement proper sync when backend supports it
    // For now, just return the current cart
    return this.getCart();
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
