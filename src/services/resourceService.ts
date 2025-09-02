import { apiRequest } from "./api";
import {
  Resource,
  ResourceCategory,
  ResourcesResponse,
  CategoriesResponse,
  ResourceFilters,
} from "../types/resource";

class ResourceService {
  /**
   * Obtener todos los recursos con filtros y paginación
   */
  async getResources(
    filters: ResourceFilters = {}
  ): Promise<ResourcesResponse> {
    const params = new URLSearchParams();

    if (filters.category_id) {
      params.append("category_id", filters.category_id);
    }
    if (filters.page) {
      params.append("page", filters.page.toString());
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }
    if (filters.search) {
      params.append("search", filters.search);
    }

    const queryString = params.toString();
    const url = queryString ? `/resources?${queryString}` : "/resources";

    console.log("[ResourceService] Fetching resources:", url);

    const response = await apiRequest(url, {
      method: "GET",
    });

    // Adaptar respuesta según estructura del backend
    let resourcesData: Resource[] = [];
    let totalPages = 1;
    let total = 0;

    if (Array.isArray(response.resources)) {
      resourcesData = response.resources;
      totalPages = response.totalPages || 1;
      total = response.total || resourcesData.length;
    } else if (Array.isArray(response[0])) {
      // Mapear la estructura real del backend
      resourcesData = response[0].map((res: any) => ({
        id: res.id,
        resource_name: res.name,
        resource_desc: res.description,
        resource_img: res.url_image,
        resource_price: parseFloat(res.becoin_value || 0),
        resource_quanity: res.limit_app || 999, // Si no hay límite, mostrar 999
        resource_discount: parseFloat(res.discount || 0),
        category_id: res.resource_type_id,
        created_at: res.created_at,
        updated_at: res.updated_at || res.created_at,
      }));
      totalPages = Math.ceil(
        (response[1] || resourcesData.length) / (filters.limit || 20)
      );
      total = response[1] || resourcesData.length;
    }

    const safeResponse = {
      resources: resourcesData,
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
      totalPages,
    };

    console.log("[ResourceService] Resources response:", safeResponse);
    return safeResponse;
  }

  /**
   * Obtener todas las categorías de recursos
   */
  async getCategories(): Promise<CategoriesResponse> {
    console.log("[ResourceService] Fetching categories");

    const response = await apiRequest("/category", {
      method: "GET",
    });

    // Chequeo defensivo para soportar respuesta con índices numéricos y/o propiedad categories
    let categories: ResourceCategory[] = [];
    if (Array.isArray(response?.categories) && response.categories.length > 0) {
      categories = response.categories;
    } else if (Array.isArray(response?.[0])) {
      categories = response[0];
    }
    const safeResponse = { ...response, categories };

    console.log("[ResourceService] Categories response:", safeResponse);
    return safeResponse;
  }

  /**
   * Obtener un recurso específico por ID
   */
  async getResourceById(id: string): Promise<Resource> {
    console.log("[ResourceService] Fetching resource by ID:", id);

    const response = await apiRequest(`/resources/${id}`, {
      method: "GET",
    });

    console.log("[ResourceService] Resource detail response:", response);
    return response;
  }

  /**
   * Buscar recursos por texto
   */
  async searchResources(
    query: string,
    filters: Omit<ResourceFilters, "search"> = {}
  ): Promise<ResourcesResponse> {
    return this.getResources({ ...filters, search: query });
  }
}

export const resourceService = new ResourceService();
