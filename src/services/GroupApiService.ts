import { CloudinaryService } from "./cloudinary/cloudinary.service";
import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Group Types
export interface GroupType {
  id: string;
  name: string;
  created_at: string;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  image_url?: string;
  description: string;
  message_invitation: string;
  latitude: string;
  longitude: string;
  user_address_id: string;
  is_active: boolean;
  status: string;
  is_leader?: boolean;
  is_delete: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  event_at?: Date | string;
  user_id: string;
  group_type: GroupType | string;
  group_type_id: string;
  privacy_id: string;
  payment_type_id?: string;
  payment_type?: PaymentType;
  event_pass_id: string;
  cart?: GroupPurchaseCart; // Added cart relation
}

// Group Privacy
export interface GroupPrivacy {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_visible: boolean;
  allow_free_join: boolean;
  require_approval: boolean;
  is_active: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    full_name?: string;
    profile_picture_url?: string;
    created_at?: string;
  };
  role: "LEADER" | "MEMBER";
  joined_at?: string;
  created_at?: string;
  // backend does not include contribution/payment in DTO by default
}

export interface GroupMemberConsumption {
  id: string;
  group_id: string;
  group_member_id: string;
  product_id: string;
  user_id: string;
  groupMember?: {
    user_id: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsumptionSummary {
  product_id: string;
  product_name: string;
  product_image_url?: string;
  total_consumers: number;
  users: string[];
}

// Group Purchase Cart Types
export interface GroupPurchaseCartItem {
  id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  user_id?: string | null;
}

export interface GroupPurchaseCart {
  id: string;
  user_id: string;
  group_id?: string;
  address_id?: string;
  payment_type_id?: string;
  total_amount: number;
  total_becoin?: number;
  total_weight?: number;
  total_items: number;
  delivery_cost?: number;
  distance_km?: number;
  duration_min?: number;
  delivery_at?: Date;
  items: GroupPurchaseCartItem[];
  created_at: Date;
  updated_at: Date;
}

export interface GroupOrder {
  id: string;
  group_id: string;
  order_id: string;
  member_id: string;
  items: GroupOrderItem[];
  subtotal: number;
  member_contribution: number;
  status: "pending" | "confirmed" | "completed";
}

export interface GroupOrderItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  member_id: string;
}

export interface PaymentType {
  id: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  message_invitation?: string;
  user_address_id?: string;
  group_type_id?: string;
  privacy_id?: string;
  payment_type_id?: string;
  event_at?: string | Date;
}

export interface UpdateGroupDto {
  name?: string;
  description: string;
  location?: string;
  location_url?: string;
  date_time?: string | Date;
  status?: "ACTIVE" | "PENDING" | "INACTIVE" | "DELETE";
}

export interface InviteToGroupDto {
  email?: string;
  username?: string;
  phone?: string | number;
  role?: "LEADER" | "MEMBER";
}

export interface GroupQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
  name?: string;
  status?: "ACTIVE" | "PENDING" | "INACTIVE" | "DELETE";
}

class GroupServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    GROUPS: "groups",
    GROUP_MEMBERS: "groups/members",
    GROUP_INVITATIONS: "groups/invitations",
    GROUP_ORDERS: "groups/orders",
    MY_GROUPS: "groups/by-user",
    GROUP_TYPE: "group-type",
    // join/leave not implemented in backend; membership managed via group-members or group-invitations
  } as const;

  /**
   * Get group types (dynamic from backend)
   */
  async getGroupTypes(page = 1, limit = 20): Promise<GroupType[]> {
    const res = await this.get<any>(
      `${this.ENDPOINTS.GROUP_TYPE}?page=${page}&limit=${limit}`,
    );
    // Si la respuesta es { data: [...] }
    if (res && Array.isArray(res.data)) return res.data;
    // Si la respuesta es un array anidado tipo [[...], total]
    if (Array.isArray(res) && Array.isArray(res[0])) return res[0];
    // Si la respuesta es un array plano
    if (Array.isArray(res)) return res;
    // Si no, devolver array vacío
    return [];
  }

  /**
   * Get groups with filtering and pagination
   */
  async getGroups(query: GroupQuery = {}): Promise<PaginatedResponse<Group>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `${this.ENDPOINTS.GROUPS}?${queryString}`
      : this.ENDPOINTS.GROUPS;

    const res = await this.get<any>(endpoint);

    // Handle wrapped format [[data], count]
    if (Array.isArray(res) && Array.isArray(res[0])) {
      return {
        data: res[0],
        total: res[1] || 0,
        page: 1,
        limit: res[0].length,
        totalPages: 1,
      };
    }

    // Handle direct PaginatedResponse
    if (res?.data) return res;

    // Handle direct array
    if (Array.isArray(res))
      return {
        data: res,
        total: res.length,
        page: 1,
        limit: res.length,
        totalPages: 1,
      };

    return { data: [], total: 0, page: 1, limit: 0, totalPages: 0 };
  }

  /**
   * Get a specific group by ID
   */
  async getGroup(id: string): Promise<Group> {
    return this.get<Group>(`${this.ENDPOINTS.GROUPS}/${id}`);
  }

  /**
   * Get payment types for groups
   */
  async getPaymentTypes(): Promise<PaymentType[]> {
    const res = await this.get<any>("payment-types");
    if (Array.isArray(res?.data)) return res.data;
    // Handle wrapped format [[data], count]
    if (Array.isArray(res) && Array.isArray(res[0])) return res[0];
    // Handle direct array
    if (Array.isArray(res)) return res;
    return [];
  }

  /**
   * Get current user's groups
   */
  async getMyGroups(
    params: {
      status?: Group["is_active"];
      role?: "admin" | "member";
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedResponse<Group>> {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.MY_GROUPS}?${queryString}`
      : this.ENDPOINTS.MY_GROUPS;

    return this.get<PaginatedResponse<Group>>(endpoint);
  }

  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupDto): Promise<Group> {
    return this.post<Group>(this.ENDPOINTS.GROUPS, data);
  }

  /**
   * Update a group
   */
  async updateGroup(id: string, data: UpdateGroupDto): Promise<Group> {
    return this.put<Group>(`${this.ENDPOINTS.GROUPS}/${id}`, data);
  }

  /**
   * Delete a group
   */
  async deleteGroup(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`${this.ENDPOINTS.GROUPS}/${id}`);
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    // Usa el endpoint real del backend para obtener miembros de grupo
    return this.get<GroupMember[]>(`group-members/group/${groupId}`);
  }

  /**
   * Join a public group or add member to group
   */
  async joinGroup(groupId: string, userId: string): Promise<GroupMember> {
    return this.post<GroupMember>("group-members", {
      group_id: groupId,
      user_id: userId,
    });
  }

  /**
   * Leave a group
   */
  async leaveGroup(
    groupId: string,
    userId: string,
  ): Promise<{
    message: string;
    success: boolean;
  }> {
    return this.delete(
      `group-members/group-and-user?groupId=${groupId}&userId=${userId}`,
    );
  }

  /**
   * Invite users to group
   */
  async inviteToGroup(groupId: string, invite: InviteToGroupDto): Promise<any> {
    // Backend exposes POST /groups/:groupId/members to invite/add member
    return this.post(`${this.ENDPOINTS.GROUPS}/${groupId}/members`, invite);
  }

  /**
   * Join a group
   */
  // join/leave flows are handled by group-members and group-invitations on the backend

  /**
   * Remove member from group (admin only)
   */
  async removeMember(
    groupId: string,
    memberId: string,
  ): Promise<{ success: boolean }> {
    return this.delete(`group-members/${memberId}`);
  }

  /**
   * Update member role (admin only)
   */
  async updateMemberRole(
    groupId: string,
    memberId: string,
    role: "LEADER" | "MEMBER",
  ): Promise<GroupMember> {
    return this.patch<GroupMember>(
      `${this.ENDPOINTS.GROUPS}/${groupId}/members/${memberId}`,
      { role },
    );
  }

  /**
   * Get group orders
   */
  // Order/message/stats endpoints not present in backend; removed from service

  // --- Group Invitations endpoints (backend: /group-invitations) ---
  async createInvitation(data: {
    group_id: string;
    email?: string;
    username?: string;
    phone?: string;
    role?: string;
  }): Promise<any> {
    return this.post(`${this.ENDPOINTS.GROUP_INVITATIONS}`, data);
  }

  async getMyPendingInvitations(): Promise<any[]> {
    return this.get(`${this.ENDPOINTS.GROUP_INVITATIONS}/my-pending`);
  }

  async getMyAcceptedInvitations(): Promise<any[]> {
    return this.get(`${this.ENDPOINTS.GROUP_INVITATIONS}/my-accepted`);
  }

  async getMyRejectedInvitations(): Promise<any[]> {
    return this.get(`${this.ENDPOINTS.GROUP_INVITATIONS}/my-rejected`);
  }

  async getMyCanceledInvitations(): Promise<any[]> {
    return this.get(`${this.ENDPOINTS.GROUP_INVITATIONS}/my-canceled`);
  }

  async acceptInvitation(invitationId: string): Promise<any> {
    return this.patch(
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/accept`,
    );
  }

  async rejectInvitation(invitationId: string): Promise<any> {
    return this.patch(
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/reject`,
    );
  }

  async cancelInvitation(invitationId: string): Promise<any> {
    return this.patch(
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/cancel`,
    );
  }

  async softDeleteInvitation(invitationId: string): Promise<void> {
    return this.delete(`${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}`);
  }

  async hardDeleteInvitation(invitationId: string): Promise<void> {
    return this.delete(
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/hard`,
    );
  }

  // --- Group Member Consumptions endpoints ---

  /**
   * Obtener las sugerencias del usuario actual en un grupo
   */
  async getUserConsumptions(
    groupId: string,
  ): Promise<GroupMemberConsumption[]> {
    const res = await this.get<any>(
      `group-member-consumptions/user-consumptions/${groupId}`,
    );
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  /**
   * Obtener resumen de sugerencias por producto
   */
  async getSummaryConsumptions(groupId: string): Promise<ConsumptionSummary[]> {
    const res = await this.get<any>(
      `group-member-consumptions/summary-product/${groupId}`,
    );
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  /**
   * Obtener todos los consumos (filtrados)
   * Usado para obtener todos los consumos de un grupo y luego procesarlos en frontend
   */
  async getAllConsumptions(
    filters: Record<string, any>,
  ): Promise<GroupMemberConsumption[]> {
    const queryString = this.buildQueryString(filters);
    const endpoint = queryString
      ? `group-member-consumptions?${queryString}`
      : "group-member-consumptions";
    const res = await this.get<any>(endpoint);

    // Manejar respuesta paginada { data, total, page, limit }
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  /**
   * Obtener todos los consumos de un grupo
   */
  async getGroupAllConsumptions(
    groupId: string,
  ): Promise<GroupMemberConsumption[]> {
    // Pedimos un limite alto para traer todos
    return this.getAllConsumptions({ group_id: groupId, limit: 100 });
  }

  /**
   * Crear una sugerencia de consumo
   */
  async createConsumption(
    groupId: string,
    productId: string,
    notes?: string,
    userId?: string, // [NEW] Added to support assignment
  ): Promise<GroupMemberConsumption> {
    const body: any = {
      group_id: groupId,
      product_id: productId,
      notes,
    };
    if (userId) body.user_id = userId;

    return this.post<GroupMemberConsumption>("group-member-consumptions", body);
  }

  /**
   * Eliminar una sugerencia de consumo
   */
  async deleteConsumption(consumptionId: string): Promise<void> {
    return this.delete(`group-member-consumptions/${consumptionId}`);
  }

  // --- Carts endpoints ---

  /**
   * Obtener el carrito del usuario autenticado
   */
  async getMyCart(groupId?: string): Promise<any> {
    const url = groupId ? `carts/user?group_id=${groupId}` : "carts/user";
    return this.get<any>(url);
  }

  /**
   * Crear un nuevo carrito
   */
  async createCart(userId: string): Promise<any> {
    return this.post("carts", { user_id: userId });
  }

  /**
   * Actualizar el grupo de un carrito
   */
  async updateCartGroup(cartId: string, groupId: string): Promise<any> {
    return this.put(`carts/${cartId}?group_id=${groupId}`, {});
  }

  /**
   * Agregar producto al carrito (simplificado para usar cart-items)
   */
  async addProductToGroupCart(
    groupId: string,
    product: {
      id: string;
      name: string;
      price: number;
      image_url?: string;
      description?: string;
    },
    quantity: number,
    suggestedBy: string,
  ): Promise<GroupPurchaseCart> {
    // Obtener carrito del usuario
    let cart = await this.getMyCart(groupId);

    // Si no tiene carrito, crear uno
    if (!cart) {
      cart = await this.post("carts", {});
      if (cart && cart.id && groupId) {
        cart = await this.updateCartGroup(cart.id, groupId);
      }
    } else {
      // [MODIFICATION] Context Switching Logic
      // Since backend enforces 1 user = 1 cart, we must simulate "per group" carts
      // by clearing the cart if the user switches groups.
      if (cart.group_id && String(cart.group_id) !== String(groupId)) {
        await this.clearGroupCart(cart.id);
        await this.updateCartGroup(cart.id, groupId);
        // Re-fetch clean cart
        cart = await this.getMyCart(groupId);
      } else if (!cart.group_id && groupId) {
        await this.updateCartGroup(cart.id, groupId);
      }
    }

    // Agregar item usando el endpoint de cart-items
    await this.post("cart-items", {
      cart_id: cart.id,
      product_id: product.id,
      quantity,
      unit_price: product.price,
    });

    // Recargar carrito actualizado
    return this.getMyCart(groupId);
  }

  /**
   * Remover producto del carrito
   */
  async removeProductFromGroupCart(
    groupId: string,
    cartItemId: string,
  ): Promise<GroupPurchaseCart> {
    await this.delete(`cart-items/${cartItemId}`);
    return this.getMyCart(groupId);
  }

  /**
   * Actualizar cantidad de producto en el carrito
   */
  async updateProductQuantityInGroupCart(
    groupId: string,
    cartItemId: string,
    newQuantity: number,
  ): Promise<GroupPurchaseCart> {
    await this.put(`cart-items/${cartItemId}?quantity=${newQuantity}`, {});
    return this.getMyCart(groupId);
  }

  /**
   * Vaciar el carrito
   */
  async clearGroupCart(
    cartId: string,
    groupId?: string,
  ): Promise<GroupPurchaseCart> {
    await this.put(`carts/${cartId}/empty`, {});
    return this.getMyCart(groupId);
  }

  /**
   * Get all info needed to create a group
   */
  async getInfoCreate(): Promise<{
    user_address: any[];
    group_types: GroupType[];
    group_privacies: GroupPrivacy[];
    payment_types: PaymentType[];
  }> {
    const res = await this.get<any>("groups/info-create");
    return res;
  }

  /**
   * Get group privacy options
   */
  async uploadImage(file: any): Promise<string> {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: "image/jpeg", // Ajustar según el tipo real si es necesario
      name: "upload.jpg",
    } as any);

    const response = await CloudinaryService.uploadImage(formData);
    return response;
  }

  async getGroupPrivacies(): Promise<GroupPrivacy[]> {
    const res = await this.get<any>("groups/privacy-type");
    if (Array.isArray(res?.data)) return res.data;
    // Handle wrapped format [[data], count]
    if (Array.isArray(res) && Array.isArray(res[0])) return res[0];
    // Handle direct array
    if (Array.isArray(res)) return res;
    return [];
  }
  /**
   * Add item to a specific cart by ID (used for Group Carts)
   */
  async addItemToSpecificCart(
    cartId: string,
    product: { id: string; price: number },
    quantity: number,
    isGeneral?: boolean,
  ): Promise<any> {
    const queryParams =
      isGeneral !== undefined ? `?is_general=${isGeneral}` : "";
    return this.post(`cart-items${queryParams}`, {
      cart_id: cartId,
      product_id: product.id,
      quantity: quantity,
      unit_price: product.price,
    });
  }

  /**
   * Remove item from specific cart (by CartItem ID)
   */
  async removeItemFromSpecificCart(cartItemId: string): Promise<any> {
    return this.delete(`cart-items/${cartItemId}`);
  }

  /**
   * Update item quantity in specific cart
   */
  async updateItemQuantitySpecificCart(
    cartItemId: string,
    quantity: number,
  ): Promise<any> {
    return this.put(`cart-items/quantity/${cartItemId}?quantity=${quantity}`);
  }

  /**
   * Update item quantity in specific cart by Product ID (and optional User ID)
   */
  async updateItemQuantityByProduct(
    productId: string,
    quantity: number,
    userId?: string | null,
  ): Promise<any> {
    const userParam = userId ? `&user_id=${userId}` : "";
    return this.put(
      `cart-items/quantity-by-product/${productId}?quantity=${quantity}${userParam}`,
      {},
    );
  }
  /**
   * Update payment type for a specific cart
   */
  async updateCartPaymentType(
    cartId: string,
    paymentTypeId: string,
  ): Promise<any> {
    return this.put(
      `carts/payment-type/${cartId}?payment_type_id=${paymentTypeId}`,
      {},
    );
  }

  /**
   * Get specific cart by ID (Full details)
   */
  async getCartById(cartId: string): Promise<GroupPurchaseCart> {
    return this.get<GroupPurchaseCart>(`carts/${cartId}`);
  }
}

// Export singleton instance
export const GroupService = new GroupServiceClass();
