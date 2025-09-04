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

  /**
   * Obtener recursos del usuario (descuentos y promociones)
   */
  async getUserResources(
    resourceId?: string,
    limit: number = 10,
    page: number = 1
  ): Promise<import("../types/resource").UserResourcesResponse> {
    console.log("[ResourceService] Fetching user resources:", {
      resourceId,
      limit,
      page,
    });

    const params = new URLSearchParams();
    if (resourceId) {
      params.append("resource_id", resourceId);
    }
    params.append("limit", limit.toString());
    params.append("page", page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/user-resources?${queryString}`
      : "/user-resources";

    const response = await apiRequest(url, {
      method: "GET",
    });

    console.log("[ResourceService] User resources response:", response);

    // Adaptar respuesta según estructura del backend
    let userResources: import("../types/resource").UserResource[] = [];
    let total = 0;

    if (Array.isArray(response) && response.length === 2) {
      // Respuesta tipo [data, count]
      const [resourcesData, resourcesCount] = response;

      if (Array.isArray(resourcesData)) {
        userResources = resourcesData.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          resource_id: item.resource_id,
          quantity: item.quantity || 1,
          quantity_redeemed: item.quantity_redeemed || 0,
          hash_id: item.hash_id,
          qr_code: item.qr_code,
          is_redeemed: item.is_redeemed || false,
          redeemed_at: item.redeemed_at ? new Date(item.redeemed_at) : null,
          expires_at: item.expires_at ? new Date(item.expires_at) : null,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at),
          // Información del recurso
          resource: item.resource
            ? {
                id: item.resource.id,
                code: item.resource.code,
                name: item.resource.name,
                description: item.resource.description,
                url_image: item.resource.url_image,
                becoin_value: parseFloat(item.resource.becoin_value || 0),
                discount: parseFloat(item.resource.discount || 0),
                limit_user: item.resource.limit_user || 0,
                limit_app: item.resource.limit_app || 0,
                used_account: item.resource.used_account || 0,
                is_expired: item.resource.is_expired || false,
                expires_at: item.resource.expires_at
                  ? new Date(item.resource.expires_at)
                  : null,
                created_at: new Date(item.resource.created_at),
                resource_type_id: item.resource.resource_type_id,
                user_commerce_id: item.resource.user_commerce_id,
              }
            : null,
          // Información del usuario (opcional)
          user: item.user
            ? {
                id: item.user.id,
                full_name: item.user.full_name,
                email: item.user.email,
                profile_picture_url: item.user.profile_picture_url,
              }
            : null,
        }));
        total =
          typeof resourcesCount === "number"
            ? resourcesCount
            : userResources.length;
      }
    } else if (Array.isArray(response)) {
      // Respuesta directa como array
      userResources = response.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        resource_id: item.resource_id,
        quantity: item.quantity || 1,
        quantity_redeemed: item.quantity_redeemed || 0,
        hash_id: item.hash_id,
        qr_code: item.qr_code,
        is_redeemed: item.is_redeemed || false,
        redeemed_at: item.redeemed_at ? new Date(item.redeemed_at) : null,
        expires_at: item.expires_at ? new Date(item.expires_at) : null,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
        resource: item.resource
          ? {
              id: item.resource.id,
              code: item.resource.code,
              name: item.resource.name,
              description: item.resource.description,
              url_image: item.resource.url_image,
              becoin_value: parseFloat(item.resource.becoin_value || 0),
              discount: parseFloat(item.resource.discount || 0),
              limit_user: item.resource.limit_user || 0,
              limit_app: item.resource.limit_app || 0,
              used_account: item.resource.used_account || 0,
              is_expired: item.resource.is_expired || false,
              expires_at: item.resource.expires_at
                ? new Date(item.resource.expires_at)
                : null,
              created_at: new Date(item.resource.created_at),
              resource_type_id: item.resource.resource_type_id,
              user_commerce_id: item.resource.user_commerce_id,
            }
          : null,
        user: item.user
          ? {
              id: item.user.id,
              full_name: item.user.full_name,
              email: item.user.email,
              profile_picture_url: item.user.profile_picture_url,
            }
          : null,
      }));
      total = userResources.length;
    }

    const safeResponse: import("../types/resource").UserResourcesResponse = {
      userResources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    console.log(
      "[ResourceService] Processed user resources response:",
      safeResponse
    );
    return safeResponse;
  }
}

export const resourceService = new ResourceService();
