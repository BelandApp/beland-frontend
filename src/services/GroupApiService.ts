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
  // Backend DTO fields (casing and enums match backend)
  location?: string | null;
  location_url?: string | null;
  date_time?: string | Date | null;
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "DELETE";
  created_at: string;
  updated_at?: string;
  expires_at?: string;
  leader?: { id: string; name?: string; avatar_url?: string };
  members?: GroupMember[];
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
  };
  role: "LEADER" | "MEMBER";
  joined_at?: string;
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
    MY_GROUPS: "groups/my-groups",
    // join/leave not implemented in backend; membership managed via group-members or group-invitations
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
