/**
 * Organization Service - Handles business organization registration
 * Allows users to register as merchants with professional business information
 */

import { CoreApiService } from "./core/ApiService";

// Organization Types
export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  ruc?: string;
  category?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  website?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationDto {
  name: string;
  user_id: string;
  legal_name?: string;
  ruc?: string;
  category?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}

export interface UpdateOrganizationDto {
  name?: string;
  legal_name?: string;
  ruc?: string;
  category?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}

class OrganizationService extends CoreApiService {
  /**
   * Create a new organization and transform user to MERCHANT role
   */
  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    return this.post<Organization>("/organizations", data);
  }

  /**
   * Get organization by ID
   */
  async getOrganization(id: string): Promise<Organization> {
    return this.get<Organization>(`/organizations/${id}`);
  }

  /**
   * Update organization
   */
  async updateOrganization(
    id: string,
    data: UpdateOrganizationDto
  ): Promise<Organization> {
    return this.put<Organization>(`/organizations/${id}`, data);
  }

  /**
   * Disactivate organization and revert user to USER role
   */
  async disactivateOrganization(id: string): Promise<Organization> {
    return this.put<Organization>(`/organizations/disactive/${id}`, {});
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id: string): Promise<void> {
    return this.delete(`/organizations/${id}`);
  }

  /**
   * Get user's organization
   */
  async getUserOrganization(userId: string): Promise<Organization | null> {
    try {
      // Backend returns [Organization[], count] tuple
      const [organizations] = await this.get<[Organization[], number]>(
        `/organizations?user_id=${userId}&limit=1`
      );
      return organizations && organizations.length > 0
        ? organizations[0]
        : null;
    } catch (error) {
      console.error("Error fetching user organization:", error);
      return null;
    }
  }
}

export const organizationService = new OrganizationService();
