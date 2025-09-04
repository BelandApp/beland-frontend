import { apiRequest } from "./api";

// Función para obtener el user_id real del localStorage
export function getCurrentUserId(): string {
  try {
    const authUser = localStorage.getItem("auth_user");
    console.log("🔍 CartService: Raw auth_user from localStorage:", authUser);

    if (authUser) {
      const user = JSON.parse(authUser);
      console.log("👤 CartService: Parsed user object:", user);

      // Intentar diferentes propiedades donde podría estar el ID
      const userId = user.id || user.user_id || user.userId || user.sub;
      console.log("🆔 CartService: Extracted user ID:", userId);

      if (userId) {
        return userId;
      }
    }
    throw new Error("No authenticated user found in localStorage");
  } catch (error) {
    console.error("❌ CartService: Error getting current user ID:", error);
    throw new Error("User authentication required");
  }
}

// Función para obtener el cart_id del usuario desde el backend API
export async function getUserCartId(): Promise<string> {
  try {
    console.log(
      "🛒 CartService: Getting user cart from /carts/user endpoint..."
    );

    const response = await apiRequest("/carts/user", {
      method: "GET",
    });

    console.log("✅ CartService: User cart response:", response);

    if (response && response.id) {
      console.log("🔍 CartService: Found cart_id from API:", response.id);
      return response.id;
    }

    throw new Error("No cart found for user");
  } catch (error) {
    console.error("❌ CartService: Error getting user cart from API:", error);
    throw new Error("Could not retrieve user cart");
  }
}

// Función para obtener el cart_id del usuario desde localStorage (fallback)
export function getCurrentUserCartId(): string {
  try {
    const authUser = localStorage.getItem("auth_user");

    if (authUser) {
      const user = JSON.parse(authUser);
      console.log("👤 CartService: Looking for cart_id in user:", user);

      // Buscar el cart_id en diferentes propiedades posibles
      const cartId =
        user.cart_id || user.cartId || user.active_cart_id || user.activeCartId;
      console.log("🛒 CartService: Found cart_id:", cartId);

      if (cartId) {
        return cartId;
      }
    }
    throw new Error("No cart_id found in user data");
  } catch (error) {
    console.error("❌ CartService: Error getting cart ID:", error);
    throw new Error("Cart ID not available");
  }
}

// Types para el carrito
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string; // Cambiado a product_id para consistencia con la API
  quantity: number;
  unit_price: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: Date;
  updated_at: Date;
  total_items: number;
  total_amount: number;
}

export interface CreateCartItemRequest {
  cart_id: string;
  product_id: string; // Según la documentación de la API
  quantity: number;
  unit_price: number; // Obligatorio según la documentación de la API
}

export interface UpdateCartItemRequest {
  quantity: number;
}

class CartService {
  // Obtener carrito del usuario usando /carts/user endpoint
  async getUserCart(): Promise<Cart> {
    try {
      console.log("🛒 CartService: Getting user cart from /carts/user...");

      const response = await apiRequest("/carts/user", {
        method: "GET",
      });

      console.log("✅ CartService: User cart retrieved:", response);
      return this.mapCartResponse(response);
    } catch (error) {
      console.error("❌ CartService: Error getting user cart:", error);
      throw error;
    }
  }

  // Obtener carrito completo por ID
  async getCart(cartId: string): Promise<Cart> {
    try {
      const response = await apiRequest(`/carts/${cartId}`, {
        method: "GET",
      });
      return this.mapCartResponse(response);
    } catch (error) {
      console.error("Error getting cart:", error);
      throw error;
    }
  }

  // Agregar item al carrito del usuario actual usando /carts/user endpoint
  async addCartItem(
    productId: string,
    quantity: number = 1,
    unitPrice: number // Ahora es obligatorio
  ): Promise<CartItem> {
    try {
      console.log("🛒 CartService: Adding item to user's cart", {
        productId,
        quantity,
        unitPrice,
      });

      // Obtener el cart_id del usuario desde el backend usando /carts/user
      const cartId = await getUserCartId();
      console.log("🔍 CartService: Using cart_id from /carts/user:", cartId);

      const data: CreateCartItemRequest = {
        cart_id: cartId,
        product_id: productId, // Usando product_id según la documentación de la API
        quantity,
        unit_price: unitPrice, // Ahora siempre obligatorio
      };

      console.log("📤 CartService: Sending data to /cart-items:", data);

      const response = await apiRequest("/cart-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("✅ CartService: Item added successfully:", response);
      return response as CartItem;
    } catch (error) {
      console.error("❌ CartService: Error adding cart item:", error);
      throw error;
    }
  }

  // Actualizar cantidad de item en carrito
  async updateCartItem(
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<CartItem> {
    try {
      const response = await apiRequest(`/cart-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response as CartItem;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  // Eliminar item del carrito
  async removeCartItem(itemId: string): Promise<void> {
    try {
      await apiRequest(`/cart-items/${itemId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  }

  // Limpiar carrito completo
  async clearCart(cartId: string): Promise<void> {
    try {
      await apiRequest(`/carts/${cartId}/clear`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }

  // Obtener carritos del usuario (para verificar si ya existe uno activo)
  async getUserCarts(): Promise<Cart[]> {
    try {
      console.log("🔍 CartService: Getting user carts...");

      const response = await apiRequest("/carts", {
        method: "GET",
      });

      console.log("✅ CartService: User carts retrieved:", response);
      return Array.isArray(response)
        ? response.map(this.mapCartResponse)
        : [this.mapCartResponse(response)];
    } catch (error) {
      console.error("❌ CartService: Error getting user carts:", error);
      return []; // Retornar array vacío si no hay carritos
    }
  }

  // Crear nuevo carrito
  async createCart(): Promise<Cart> {
    try {
      // Obtener el user_id real del usuario autenticado
      const userId = getCurrentUserId();
      const body = {
        user_id: userId,
      };

      console.log("🛒 CartService: Creating cart with real user ID:", userId);

      const response = await apiRequest("/carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("✅ CartService: Cart created successfully:", response);
      return this.mapCartResponse(response);
    } catch (error) {
      console.error("❌ CartService: Error creating cart:", error);
      throw error;
    }
  }

  // Helper para mapear respuesta del backend
  private mapCartResponse(response: any): Cart {
    return {
      id: response.id,
      user_id: response.user_id,
      items: response.items || [],
      created_at: new Date(response.created_at),
      updated_at: new Date(response.updated_at),
      total_items: response.total_items || response.items?.length || 0,
      total_amount: response.total_amount || 0,
    };
  }
}

export const cartService = new CartService();
