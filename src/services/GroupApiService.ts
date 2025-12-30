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
  description: string;
  message_invitation: string;
  latitude: string;
  longitude: string;
  user_address_id: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  user_id: string;
  group_type: GroupType;
  group_type_id: string;
  privacy_id: string;
  event_pass_id: string;
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
  location?: string;
  location_url?: string;
  date_time?: string | Date;
  status?: "ACTIVE" | "PENDING" | "INACTIVE" | "DELETE";
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
      `${this.ENDPOINTS.GROUP_TYPE}?page=${page}&limit=${limit}`
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

    return this.get<PaginatedResponse<Group>>(endpoint);
  }

  /**
   * Get a single group by ID
   */
  async getGroup(id: string): Promise<Group> {
    return this.get<Group>(`${this.ENDPOINTS.GROUPS}/${id}`);
  }

  /**
   * Get group privacy types (dynamic from backend)
   */
  async getGroupPrivacies(): Promise<GroupPrivacy[]> {
    const res = await this.get<any>("groups/privacy-type");
    if (Array.isArray(res?.data)) return res.data;
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
    role: "LEADER" | "MEMBER"
  ): Promise<GroupMember> {
    return this.patch<GroupMember>(
      `${this.ENDPOINTS.GROUPS}/${groupId}/members/${memberId}`,
      { role }
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
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/accept`
    );
  }

  async rejectInvitation(invitationId: string): Promise<any> {
    return this.patch(
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/reject`
    );
  }

  async cancelInvitation(invitationId: string): Promise<any> {
    return this.patch(
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/cancel`
    );
  }

  async softDeleteInvitation(invitationId: string): Promise<void> {
    return this.delete(`${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}`);
  }

  async hardDeleteInvitation(invitationId: string): Promise<void> {
    return this.delete(
      `${this.ENDPOINTS.GROUP_INVITATIONS}/${invitationId}/hard`
    );
  }
}

// Export singleton instance
export const GroupService = new GroupServiceClass();
