/**
 * Services API Service - Consolidated service management operations
 * Handles service browsing, group services creation, and service management
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  cost: number; // Cost base para división
  price: number; // Precio en moneda
  price_becoin: number; // Precio en Becoins
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupService {
  id: string;
  group_id: string;
  service_id: string;
  service: Service;
  created_by: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupServiceDto {
  service_id: string;
  payment_type: "EQUAL_SPLIT" | "FULL";
  created_by: string;
}

class ServicesServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    SERVICES: "services",
    GROUP_SERVICES: "group-services",
  } as const;

  /**
   * Get all available services
   */
  async getServices(): Promise<Service[]> {
    const response = await this.get<any>(this.ENDPOINTS.SERVICES);

    // Handle different response formats from backend
    if (Array.isArray(response)) {
      // Check if it's wrapped format [[...], count]
      if (Array.isArray(response[0])) {
        return response[0] as Service[];
      }
      // Direct array format
      return response as Service[];
    }

    // Handle object format { data: [...] } or { services: [...] }
    if (response && typeof response === "object") {
      if ("data" in response) {
        return (response as any).data as Service[];
      }
      if ("services" in response) {
        return (response as any).services as Service[];
      }
    }

    return [];
  }

  /**
   * Get services for a specific group
   */
  async getGroupServices(groupId: string): Promise<GroupService[]> {
    const response = await this.get<any>(
      `${this.ENDPOINTS.GROUP_SERVICES}?group_id=${groupId}`,
    );

    // Handle wrapped array format
    if (Array.isArray(response) && Array.isArray(response[0])) {
      return response[0] as GroupService[];
    }

    // Handle direct array format
    if (Array.isArray(response)) {
      return response as GroupService[];
    }

    return [];
  }

  /**
   * Create a group service
   */
  async createGroupService(
    groupId: string,
    serviceId: string,
    paymentTypeId?: string,
  ): Promise<GroupService> {
    const payload: any = {
      group_id: groupId,
      service_id: serviceId,
    };

    if (paymentTypeId) {
      payload.payment_type_id = paymentTypeId;
    }

    const response = await this.post<GroupService>(
      this.ENDPOINTS.GROUP_SERVICES,
      payload,
    );
    return response;
  }

  /**
   * Complete a group service
   */
  async completeGroupService(groupServiceId: string): Promise<GroupService> {
    const response = await this.post<GroupService>(
      `${this.ENDPOINTS.GROUP_SERVICES}/complete/${groupServiceId}`,
      {},
    );
    return response;
  }

  /**
   * Delete a group service
   */
  async deleteGroupService(groupServiceId: string): Promise<void> {
    await this.delete(`${this.ENDPOINTS.GROUP_SERVICES}/${groupServiceId}`);
  }
}

export const ServicesApiService = new ServicesServiceClass();
