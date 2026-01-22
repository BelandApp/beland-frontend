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
  user_id?: string | null;
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
  group_id?: string;
  payment_type_id?: string;
  payment_type?: {
    id: string;
    code: string;
    name: string;
  };
  delivery_cost?: number;
  distance_km?: number;
  duration_min?: number;
  delivery_at?: string;
  address_id?: string;
}

export interface AddToCartDto {
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
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
    CART_ITEMS_QUANTITY: "cart-items/quantity",
    DELIVERY_COST: "delivery/cost",
  } as const;

  /**
   * Get current user's cart with all items
   * If cart doesn't exist in backend (500 error), create it
   */
  async getCart(): Promise<Cart> {
    try {
      return await this.get<Cart>(this.ENDPOINTS.CART);
    } catch (error: any) {
      // If cart doesn't exist (500 error), create a new cart
      if (error?.status === 500) {
        console.log("[CartService] Cart not found, creating new cart");

        try {
          // Get current user ID
          const userInfo = await this.get<{ id: string }>("auth/me");

          // Create new cart by calling POST /carts with user_id
          const newCart = await this.post<Cart>("carts", {
            user_id: userInfo.id,
          });
          console.log("[CartService] Cart created successfully:", newCart.id);
          return newCart;
        } catch (createError) {
          console.error("[CartService] Failed to create cart:", createError);
          throw createError;
        }
      }

      // Re-throw other errors
      throw error;
    }
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
   * Add item to cart or increment quantity if already exists
   * Backend will automatically add the quantity to existing items
   */
  async addToCart(data: {
    product_id: string;
    quantity: number;
    is_general?: boolean;
  }): Promise<CartItem> {
    const cart = await this.getCart();
    const product = await this.getProduct(data.product_id);

    // Get current user ID to explicitly assign ownership
    const userInfo = await this.get<{ id: string }>("auth/me");

    const cartItemData: AddToCartDto = {
      cart_id: cart.id,
      product_id: data.product_id,
      quantity: data.quantity,
      unit_price: product.price,
    };

    // Construct query params
    const params = new URLSearchParams();

    // Create params object
    if (data.is_general) {
      params.append("is_general", "true");
    } else {
      // For personal items, explicitly send the user_id as query param
      // This is a common pattern in this API (seen in updateProductQuantity)
      params.append("user_id", userInfo.id);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";

    return this.post<CartItem>(
      `${this.ENDPOINTS.CART_ITEMS}${queryString}`,
      cartItemData,
    );
  }

  /**
   * Update cart item quantity - Replaces the quantity (does not add)
   */
  async updateCartItem(
    itemId: string,
    data: UpdateCartItemDto,
  ): Promise<CartItem> {
    return this.put<CartItem>(
      `${this.ENDPOINTS.CART_ITEMS_QUANTITY}/${itemId}?quantity=${data.quantity}`,
      {},
    );
  }

  /**
   * Update quantity by product ID, optionally targeting a specific user's assignment
   */
  async updateProductQuantity(
    productId: string,
    quantity: number,
    userId?: string,
  ): Promise<CartItem> {
    const userParam = userId ? `&user_id=${userId}` : "";
    return this.put<CartItem>(
      `${
        this.ENDPOINTS.CART_ITEMS
      }/quantity-by-product/${productId}?quantity=${quantity}${userParam}`,
      {},
    );
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.CART_ITEMS}/${itemId}`,
    );
  }

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<{ success: boolean }> {
    const cart = await this.getCart();
    // !NOT WORKING ON BACKEND
    return this.put<{ success: boolean }>(
      `${this.ENDPOINTS.CLEAR_CART}/${cart.id}`,
    );
  }

  /**
   * Set a group for the cart (for group orders)
   */
  async setCartGroup(groupId: string): Promise<Cart> {
    const cart = await this.getCart();
    return this.put<Cart>(`carts/group/${cart.id}?group_id=${groupId}`, {});
  }

  /**
   * Set payment type for the cart (FULL or EQUAL_SPLIT)
   */
  async setPaymentType(paymentTypeId: string): Promise<Cart> {
    const cart = await this.getCart();
    return this.put<Cart>(
      `carts/payment-type/${cart.id}?payment_type_id=${paymentTypeId}`,
      {},
    );
  }

  /**
   * Set delivery address for the cart
   */
  async setCartAddress(addressId: string): Promise<Cart> {
    const cart = await this.getCart();
    return this.put<Cart>(
      `carts/address/${cart.id}?address_id=${addressId}`,
      {},
    );
  }

  /**
   * Set delivery details (cost, distance, duration)
   */
  async setDeliveryDetails(data: {
    delivery_cost: number;
    distance_km: number;
    duration_min: number;
  }): Promise<Cart> {
    const cart = await this.getCart();
    return this.put<Cart>(`carts/delivery/${cart.id}`, data);
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
    driverLat: number;
    driverLon: number;
    customerLat: number;
    customerLon: number;
  }): Promise<{
    ok: boolean;
    distanceKm: number;
    durationMin: number;
    cost: number;
  }> {
    return this.post(this.ENDPOINTS.DELIVERY_COST, data);
  }

  /**
   * Remove group from cart (Workaround for backend bug)
   */
  async removeGroupFromCart(cartId: string): Promise<Cart> {
    return this.put<Cart>(`carts/${cartId}`, { group_id: null });
  }
}

// Export singleton instance
export const CartService = new CartServiceClass();
