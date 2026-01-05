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
  description?: string;
  phone?: string;
  email?: string;
  address_id: string;
  logo_url?: string;
  website?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationDto {
  name: string;
  legal_name?: string;
  ruc?: string;
  description?: string;
  phone?: string;
  email?: string;
  address_id?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}

export interface UpdateOrganizationDto {
  name?: string;
  legal_name?: string;
  ruc?: string;
  description?: string;
  phone?: string;
  email?: string;
  address_id?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}

class OrganizationService extends CoreApiService {
  /**
   * Create a new organization and transform user to MERCHANT role
   */
  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    return this.post<Organization>("/merchants", data);
  }

  /**
   * Get organization by ID
   */
  async getOrganization(id: string): Promise<Organization> {
    return this.get<Organization>(`/merchants/${id}`);
  }

  /**
   * Update organization
   */
  async updateOrganization(
    id: string,
    data: UpdateOrganizationDto
  ): Promise<Organization> {
    return this.put<Organization>(`/merchants/${id}`, data);
  }

  /**
   * Disactivate organization and revert user to USER role
   */
  async disactivateOrganization(id: string): Promise<Organization> {
    return this.put<Organization>(`/merchants/disactive/${id}`, {});
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id: string): Promise<void> {
    return this.delete(`/merchants/${id}`);
  }

  /**
   * Get user's organization
   */
  async getUserOrganization(userId: string): Promise<Organization | null> {
    try {
      // New backend provides endpoint GET /merchants/user/:user_id
      // Disable retries and reduce timeout for this check because backend
      // may return a server error when the merchant does not exist; we
      // want to fail fast and open the modal without long delays.
      const org = await this.get<Organization>(`/merchants/user/${userId}`, {
        retries: 0,
        timeout: 5000,
      });
      return org || null;
    } catch (error) {
      // If the backend responds with a not-found style error or a
      // message indicating "No se encontró", treat it as "no org".
      try {
        const e: any = error;
        const msg =
          e?.details?.message ||
          e?.message ||
          (e?.details && JSON.stringify(e.details));
        if (
          e?.status === 404 ||
          (typeof msg === "string" && msg.includes("No se encontró"))
        ) {
          return null;
        }
      } catch (inner) {
        // ignore parsing errors
      }

      console.error("Error fetching user organization:", error);
      return null;
    }
  }
}

export const organizationService = new OrganizationService();
