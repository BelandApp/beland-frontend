import {
  CreateExperienceDto,
  Experience,
  UpdateExperienceDto,
} from "src/types";
import { CoreApiService, PaginatedResponse } from "../core";

class ExperienceServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    EXPERIENCES: "experiences",
  };

  /**
   * Get products with optional filtering and pagination
   */
  async getProducts(): Promise<PaginatedResponse<Experience>> {
    // The backend returns {Experience: BackendExperience[], total: number, page: number, limit: number}
    // We need to map this to our PaginatedResponse format and convert string numbers to actual numbers
    const response = await this.get<{
      experience: Array<Experience>;
      total: number;
      page: number;
      limit: number;
    }>(this.ENDPOINTS.EXPERIENCES);
    // Map backend experiences to frontend experience interface
    const mappedExperience: Experience[] = response.experience.map(
      (backendExperience) => ({
        id: backendExperience.id,
        name: backendExperience.name,
        description: backendExperience.description,
        price: backendExperience.price,
        video_url: backendExperience.video_url,
        image_url: backendExperience.image_url,
        created_at: backendExperience.created_at,
        updated_at: backendExperience.updated_at,
        likes: backendExperience.likes,
        tags: backendExperience.tags,
        creator: backendExperience.creator,
        is_experience: backendExperience.is_experience,
      }),
    );

    return {
      data: mappedExperience,
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
    };
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Experience> {
    return await this.get<Experience>(`${this.ENDPOINTS.EXPERIENCES}/${id}`);
  }

  /**
   * Create a new Experience (admin only)
   */
  async createExperience(data: CreateExperienceDto): Promise<Experience> {
    return this.post<Experience>(this.ENDPOINTS.EXPERIENCES, data);
  }

  /**
   * Update a Experience (admin only)
   */
  async updateExperience(
    id: string,
    data: UpdateExperienceDto,
  ): Promise<Experience> {
    return this.patch<Experience>(`${this.ENDPOINTS.EXPERIENCES}/${id}`, data);
  }

  /**
   * Delete a Experience (admin only)
   */
  async deleteExperience(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.EXPERIENCES}/${id}`,
    );
  }

  /**
   * Upload product image (admin only)
   */
  async uploadProductImage(
    experienceId: string,
    imageFile: FormData,
  ): Promise<{ image_url: string }> {
    return this.request<{ image_url: string }>(
      `${this.ENDPOINTS.EXPERIENCES}/${experienceId}/image`,
      {
        method: "POST",
        body: imageFile,
        headers: {}, // Don't set Content-Type for FormData
      },
    );
  }
}

// Export singleton instance
export const ExperienceService = new ExperienceServiceClass();
