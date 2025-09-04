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
  unit_price: string; // Viene como string del API
  created_at?: Date;
  updated_at?: Date;
  // Información del producto que puede venir del endpoint /cart-items
  product?: {
    name?: string;
    image_url?: string;
    image?: string;
    price?: number;
    description?: string;
    [key: string]: any;
  };
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

  // Obtener items del carrito usando el endpoint /cart-items
  async getCartItems(cartId: string): Promise<CartItem[]> {
    try {
      console.log(
        "🛒 CartService: Getting cart items from /cart-items for cart:",
        cartId
      );

      const response = await apiRequest(
        `/cart-items?cart_id=${cartId}&limit=100&page=1`,
        {
          method: "GET",
        }
      );

      console.log("✅ CartService: Cart items retrieved:", response);

      // La respuesta viene como [items[], totalCount]
      if (Array.isArray(response) && response.length >= 1) {
        const items = response[0]; // Los items están en el primer elemento
        console.log("📦 CartService: Extracted cart items:", items);
        return Array.isArray(items) ? items : [];
      }

      return [];
    } catch (error) {
      console.error("❌ CartService: Error getting cart items:", error);
      return [];
    }
  }

  // Sincronizar carrito local con el servidor
  async syncCartWithServer(): Promise<{
    serverItems: CartItem[];
    cartId: string;
  } | null> {
    try {
      console.log("🔄 CartService: Syncing cart with server...");

      // Obtener el cart_id del usuario
      const cartId = await getUserCartId();
      console.log("🛒 CartService: Found cart_id:", cartId);

      // Obtener items existentes en el servidor
      const serverItems = await this.getCartItems(cartId);
      console.log("📦 CartService: Server cart items:", serverItems);

      return { serverItems, cartId };
    } catch (error) {
      console.error("❌ CartService: Error syncing cart with server:", error);
      return null;
    }
  }

  // Procesar items del carrito usando directamente los datos del endpoint /cart-items
  processCartItems(cartItems: CartItem[]): any[] {
    try {
      console.log(
        "🔍 CartService: Processing cart items with existing data..."
      );

      const processedItems = cartItems.map((item) => {
        // Usar directamente los datos que vienen del endpoint /cart-items
        // Solo falta el nombre del producto que vendrá desde el backend
        return {
          id: item.product_id,
          name: item.product?.name || `Producto ${item.product_id}`, // Usar el nombre del producto cuando esté disponible
          price: parseFloat(item.unit_price),
          quantity: item.quantity,
          image: item.product?.image_url || item.product?.image, // Usar la imagen del producto si está disponible
          // Mantener datos originales del item para referencia
          cart_item_id: item.id,
          cart_id: item.cart_id,
          available: true, // Asumimos que si está en el carrito está disponible
        };
      });

      console.log("✅ CartService: Cart items processed successfully");
      return processedItems;
    } catch (error) {
      console.error("❌ CartService: Error processing cart items:", error);
      return cartItems.map((item) => ({
        id: item.product_id,
        name: `Producto ${item.product_id}`,
        price: parseFloat(item.unit_price),
        quantity: item.quantity,
        cart_item_id: item.id,
        cart_id: item.cart_id,
        available: true,
      }));
    }
  }

  // Verificar si un producto ya existe en el carrito del usuario
  async checkProductInCart(productId: string): Promise<CartItem | null> {
    try {
      console.log(
        "🔍 CartService: Checking if product exists in cart:",
        productId
      );

      const cartId = await getUserCartId();
      const cart = await this.getCart(cartId);

      const existingItem = cart.items.find(
        (item) => item.product_id === productId
      );

      if (existingItem) {
        console.log("✅ CartService: Product found in cart:", existingItem);
        return existingItem;
      }

      console.log("❌ CartService: Product not found in cart");
      return null;
    } catch (error) {
      console.error("❌ CartService: Error checking product in cart:", error);
      return null;
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

      // Primero verificar si el producto ya existe en el carrito
      console.log(
        "🔍 CartService: Checking if product already exists in cart..."
      );
      const existingItem = await this.checkProductInCart(productId);

      if (existingItem) {
        console.log(
          "📝 CartService: Product already exists, updating quantity instead"
        );
        const newQuantity = existingItem.quantity + quantity;
        return await this.updateCartItem(existingItem.id, {
          quantity: newQuantity,
        });
      }

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
    } catch (error: any) {
      console.error("❌ CartService: Error adding cart item:", error);

      // Si aún obtenemos error de duplicate key como fallback, manejar graciosamente
      if (
        error.message &&
        (error.message.includes("duplicate key") ||
          error.message.includes("unique constraint"))
      ) {
        console.log(
          "🔄 CartService: Handling duplicate key error as fallback..."
        );

        try {
          const existingItem = await this.checkProductInCart(productId);
          if (existingItem) {
            console.log(
              "📝 CartService: Found existing item via fallback, updating quantity"
            );
            const newQuantity = existingItem.quantity + quantity;
            return await this.updateCartItem(existingItem.id, {
              quantity: newQuantity,
            });
          }
        } catch (fallbackError) {
          console.error(
            "❌ CartService: Fallback update also failed:",
            fallbackError
          );
          throw new Error(
            "No se pudo agregar el producto al carrito. El producto puede ya existir."
          );
        }
      }

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
