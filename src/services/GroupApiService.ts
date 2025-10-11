/**
 * Group Service - Consolidated group management operations
 * Handles group creation, management, invitations, and purchases
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  type: "purchase" | "recycling" | "community";
  status: "active" | "completed" | "cancelled";
  creator_id: string;
  creator: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  location?: string;
  delivery_time?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  member_count: number;
  max_members?: number;
  is_public: boolean;
  join_code?: string;
  total_amount?: number;
  payment_status?: "pending" | "partial" | "completed";
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  role: "admin" | "member";
  status: "pending" | "accepted" | "declined";
  joined_at: string;
  contribution_amount?: number;
  payment_status?: "pending" | "paid";
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

export interface CreateGroupDto {
  name: string;
  description?: string;
  type: Group["type"];
  location?: string;
  delivery_time?: string;
  max_members?: number;
  is_public?: boolean;
  expires_at?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  location?: string;
  delivery_time?: string;
  max_members?: number;
  is_public?: boolean;
  expires_at?: string;
}

export interface InviteToGroupDto {
  email?: string;
  user_id?: string;
  phone?: string;
  message?: string;
}

export interface GroupQuery {
  page?: number;
  limit?: number;
  type?: Group["type"];
  status?: Group["status"];
  creator_id?: string;
  is_member?: boolean;
  location?: string;
  search?: string;
}

class GroupServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    GROUPS: "groups",
    GROUP_MEMBERS: "groups/members",
    GROUP_INVITATIONS: "groups/invitations",
    GROUP_ORDERS: "groups/orders",
    MY_GROUPS: "groups/my-groups",
    JOIN_GROUP: "groups/join",
    LEAVE_GROUP: "groups/leave",
  } as const;

  /**
   * Get groups with filtering and pagination
   */
  async getGroups(query: GroupQuery = {}): Promise<PaginatedResponse<Group>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `${this.ENDPOINTS.GROUPS}?${queryString}`
      : this.ENDPOINTS.GROUPS;

    return this.get<PaginatedResponse<Group>>(endpoint);
  }

  /**
   * Get a single group by ID
   */
  async getGroup(id: string): Promise<Group> {
    return this.get<Group>(`${this.ENDPOINTS.GROUPS}/${id}`);
  }

  /**
   * Get current user's groups
   */
  async getMyGroups(
    params: {
      status?: Group["status"];
      role?: "admin" | "member";
      page?: number;
      limit?: number;
    } = {}
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
    return this.patch<Group>(`${this.ENDPOINTS.GROUPS}/${id}`, data);
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
    return this.get<GroupMember[]>(
      `${this.ENDPOINTS.GROUPS}/${groupId}/members`
    );
  }

  /**
   * Invite users to group
   */
  async inviteToGroup(
    groupId: string,
    invitations: InviteToGroupDto[]
  ): Promise<{
    success: boolean;
    sent_invitations: number;
    failed_invitations: { email?: string; reason: string }[];
  }> {
    return this.post(`${this.ENDPOINTS.GROUPS}/${groupId}/invite`, {
      invitations,
    });
  }

  /**
   * Join a group
   */
  async joinGroup(
    groupId: string,
    joinCode?: string
  ): Promise<{
    success: boolean;
    group: Group;
    membership: GroupMember;
  }> {
    return this.post(`${this.ENDPOINTS.JOIN_GROUP}/${groupId}`, {
      join_code: joinCode,
    });
  }

  /**
   * Join group by code
   */
  async joinGroupByCode(joinCode: string): Promise<{
    success: boolean;
    group: Group;
    membership: GroupMember;
  }> {
    return this.post(`${this.ENDPOINTS.JOIN_GROUP}/code`, {
      join_code: joinCode,
    });
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string): Promise<{ success: boolean }> {
    return this.post(`${this.ENDPOINTS.LEAVE_GROUP}/${groupId}`);
  }

  /**
   * Remove member from group (admin only)
   */
  async removeMember(
    groupId: string,
    memberId: string
  ): Promise<{ success: boolean }> {
    return this.delete(
      `${this.ENDPOINTS.GROUPS}/${groupId}/members/${memberId}`
    );
  }

  /**
   * Update member role (admin only)
   */
  async updateMemberRole(
    groupId: string,
    memberId: string,
    role: "admin" | "member"
  ): Promise<GroupMember> {
    return this.patch<GroupMember>(
      `${this.ENDPOINTS.GROUPS}/${groupId}/members/${memberId}`,
      { role }
    );
  }

  /**
   * Get group orders
   */
  async getGroupOrders(groupId: string): Promise<GroupOrder[]> {
    return this.get<GroupOrder[]>(`${this.ENDPOINTS.GROUPS}/${groupId}/orders`);
  }

  /**
   * Add items to group order
   */
  async addToGroupOrder(
    groupId: string,
    items: {
      product_id: string;
      quantity: number;
    }[]
  ): Promise<{
    success: boolean;
    order: GroupOrder;
  }> {
    return this.post(`${this.ENDPOINTS.GROUPS}/${groupId}/order/items`, {
      items,
    });
  }

  /**
   * Complete group purchase
   */
  async completeGroupPurchase(
    groupId: string,
    data: {
      payment_method: string;
      shipping_address_id: string;
      split_method: "equal" | "proportional" | "custom";
      custom_splits?: { member_id: string; amount: number }[];
    }
  ): Promise<{
    success: boolean;
    orders: string[]; // Order IDs created for each member
    total_amount: number;
  }> {
    return this.post(
      `${this.ENDPOINTS.GROUPS}/${groupId}/complete-purchase`,
      data
    );
  }

  /**
   * Get group chat messages (if chat feature exists)
   */
  async getGroupMessages(
    groupId: string,
    params: {
      page?: number;
      limit?: number;
      since?: string;
    } = {}
  ): Promise<
    PaginatedResponse<{
      id: string;
      user_id: string;
      user_name: string;
      message: string;
      created_at: string;
    }>
  > {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.GROUPS}/${groupId}/messages?${queryString}`
      : `${this.ENDPOINTS.GROUPS}/${groupId}/messages`;

    return this.get<PaginatedResponse<any>>(endpoint);
  }

  /**
   * Send message to group
   */
  async sendGroupMessage(
    groupId: string,
    message: string
  ): Promise<{
    success: boolean;
    message_id: string;
  }> {
    return this.post(`${this.ENDPOINTS.GROUPS}/${groupId}/messages`, {
      message,
    });
  }

  /**
   * Get group statistics
   */
  async getGroupStats(groupId: string): Promise<{
    total_members: number;
    total_orders: number;
    total_amount: number;
    completion_rate: number;
    average_order_value: number;
  }> {
    return this.get(`${this.ENDPOINTS.GROUPS}/${groupId}/stats`);
  }
}

// Export singleton instance
export const GroupService = new GroupServiceClass();
