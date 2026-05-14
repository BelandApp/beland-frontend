import {
  CoreApiService,
  PaginatedResponse,
  ApiResponse,
} from "./core/ApiService";
import { storage, eventStore } from "@/stores";

// Types for Admin Dashboard
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  picture?: string;
  role_name: string;
  isBlocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  price_becoin: number;
  is_active: boolean;
  category_id?: string;
  created_at: string;
}

export interface EventPass {
  id: string;
  code: string;
  name: string;
  description?: string;
  message?: string;
  image_url?: string;
  images_urls?: string[];
  qr?: string;
  event_place?: string;
  event_city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  start_sale_date?: string;
  end_sale_date?: string;
  limit_tickets: number;
  sold_tickets: number;
  available: boolean;
  attended_count: number;
  price_dollar: string;
  discount: string;
  total_becoin: string;
  is_refundable: boolean;
  refund_days_limit: number;
  is_active: boolean;
  type_id?: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventPassDto {
  code: string;
  name: string;
  description?: string;
  type_id: string;
  event_place?: string;
  address?: string;
  event_city?: string;
  latitude?: number;
  longitude?: number;
  event_date: Date;
  start_sale_date?: Date;
  end_sale_date?: Date;
  limit_tickets: number;
  price_becoin: number;
  discount?: number;
  is_refundable?: boolean;
  refund_days_limit?: number;
  is_active?: boolean;
  // Para manejar archivos de imagen - nombres correctos del backend
  image_url?: File | string;
  images_urls?: File[] | string[];
}

export interface EventPassType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalEvents: number;
  totalOrders: number;
  totalOrganizations: number;
  revenueThisMonth: number;
  activeEvents: number;
}

export class AdminApiService extends CoreApiService {
  constructor() {
    super();
  }

  // =================== USERS MANAGEMENT ===================
  async getUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.get<{
      users: AdminUser[];
      total: number;
      page: number;
      limit: number;
    }>(`users?page=${page}&limit=${limit}`);
  }

  async getUserByEmail(email: string): Promise<AdminUser> {
    return this.get<AdminUser>(
      `users/by-email?email=${encodeURIComponent(email)}`
    );
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<AdminUser> {
    return this.patch<AdminUser>(`users/${userId}`, { isBlocked });
  }

  // =================== PRODUCTS MANAGEMENT ===================
  async getProducts(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: AdminProduct[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.get<{
      data: AdminProduct[];
      total: number;
      page: number;
      limit: number;
    }>(`products?page=${page}&limit=${limit}`);
  }

  async createProduct(
    productData: Partial<AdminProduct>
  ): Promise<AdminProduct> {
    return this.post<AdminProduct>("products", productData);
  }

  async updateProduct(
    productId: string,
    productData: Partial<AdminProduct>
  ): Promise<AdminProduct> {
    return this.patch<AdminProduct>(`products/${productId}`, productData);
  }

  async deleteProduct(productId: string): Promise<void> {
    return this.delete<void>(`products/${productId}`);
  }

  // =================== EVENT PASS MANAGEMENT ===================
  async getEventPasses(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: EventPass[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.get<{
      data: EventPass[];
      total: number;
      page: number;
      limit: number;
    }>(`event-pass?page=${page}&limit=${limit}`);
  }

  async toggleEventPassStatus(
    eventId: string,
    isActive: boolean
  ): Promise<EventPass> {
    const endpoint = isActive
      ? `event-pass/active/${eventId}`
      : `event-pass/disactive/${eventId}`;
    const result = await this.put<EventPass>(endpoint, {});
    try {
      const fresh = await this.getEventPass(eventId);
      try {
        await storage.removeItem("events_cache");
      } catch (e) {
        console.warn("No se pudo limpiar events_cache:", e);
      }
      try {
        eventStore.getState().updateEvent(fresh as any);
      } catch (e) {}
      return fresh;
    } catch (err) {
      try {
        await storage.removeItem("events_cache");
      } catch (e) {
        console.warn("No se pudo limpiar events_cache:", e);
      }
      try {
        eventStore.getState().updateEvent(result as any);
      } catch (e) {}
      return result;
    }
  }

  async getEventPass(eventId: string): Promise<EventPass> {
    return this.get<EventPass>(`event-pass/${eventId}`);
  }

  async createEventPass(eventData: CreateEventPassDto): Promise<EventPass> {
    const formData = new FormData();

    // Agregar solo los campos de texto, número y fecha (excluyendo archivos y arrays)
    Object.keys(eventData).forEach((key) => {
      const value = (eventData as any)[key];
      if (
        value !== undefined &&
        value !== null &&
        key !== "image_url" &&
        key !== "images_urls"
      ) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          formData.append(key, value.toString());
        }
      }
    });

    // Lógica: si solo hay una imagen, va en image_url; si hay varias, la primera en image_url y el resto en images_urls
    const isFile = (f: unknown): f is File => {
      return (
        typeof f === "object" &&
        f !== null &&
        typeof (f as File).name === "string" &&
        typeof (f as File).size === "number"
      );
    };

    // Lógica universal: image_url es principal si existe, si no la primera de images_urls, el resto adicionales
    let mainImage: File | undefined = undefined;
    let additionalImages: File[] = [];

    if (isFile(eventData.image_url)) {
      // Si existe image_url la usamos como principal
      mainImage = eventData.image_url;
      const principal = mainImage as File;
      // Si hay images_urls, agregar sólo las que no son la misma que la principal
      if (Array.isArray(eventData.images_urls)) {
        additionalImages = eventData.images_urls
          .filter(isFile)
          .filter((img) => {
            // comparar por name/size/type para evitar duplicados
            return !(
              img.name === principal.name &&
              img.size === principal.size &&
              img.type === principal.type
            );
          });
      } else if (isFile(eventData.images_urls)) {
        const img = eventData.images_urls as File;
        if (
          !(
            img.name === principal.name &&
            img.size === principal.size &&
            img.type === principal.type
          )
        ) {
          additionalImages = [img];
        }
      }
    } else if (
      Array.isArray(eventData.images_urls) &&
      eventData.images_urls.length > 0
    ) {
      // No hay image_url, pero sí images_urls
      // Si sólo hay una imagen en el array, usarla como principal
      if (
        eventData.images_urls.length === 1 &&
        isFile(eventData.images_urls[0])
      ) {
        mainImage = eventData.images_urls[0];
        additionalImages = [];
      } else {
        mainImage = isFile(eventData.images_urls[0])
          ? eventData.images_urls[0]
          : undefined;
        additionalImages = eventData.images_urls.slice(1).filter(isFile);
      }
    } else if (isFile(eventData.images_urls)) {
      // images_urls es un solo File (no array)
      mainImage = eventData.images_urls as File;
    }

    // Agregar imagen principal
    if (mainImage) {
      formData.append("image_url", mainImage);
      console.log(
        `📎 Imagen principal (image_url): ${mainImage.name} (${mainImage.size} bytes, tipo: ${mainImage.type})`
      );
    }

    // Agregar imágenes adicionales
    if (additionalImages.length > 0) {
      additionalImages.forEach((img, idx) => {
        formData.append("images_urls", img);
        console.log(
          `📎 Imagen adicional [${idx}] (images_urls): ${img.name} (${img.size} bytes, tipo: ${img.type})`
        );
      });
    }

    console.log("🔍 Inspeccionando FormData antes del envío:");

    // Log para ver cómo armamos el objeto antes de pasarlo a FormData
    try {
      console.log(
        "[DEBUG] Objeto de datos del evento antes de FormData:",
        JSON.stringify(
          eventData,
          (key, value) => {
            // Evitar serializar archivos completos, solo mostrar nombre y tipo
            if (value instanceof File) {
              return { name: value.name, size: value.size, type: value.type };
            }
            return value;
          },
          2
        )
      );
    } catch (e) {
      console.log("[DEBUG] No se pudo serializar eventData", e);
    }

    try {
      // @ts-ignore - TypeScript issue with FormData.entries()
      for (const [key, value] of formData.entries()) {
        // Mostrar información robusta sobre el valor
        if (value instanceof File) {
          console.log(
            `   ${key}: File -> name=${value.name}, size=${value.size}, type=${value.type}`
          );
        } else if (typeof value === "object" && value !== null) {
          // Podría ser un Blob o un objeto con uri (React Native)
          const info: any = {};
          if ((value as any).name) info.name = (value as any).name;
          if ((value as any).size) info.size = (value as any).size;
          if ((value as any).type) info.type = (value as any).type;
          if ((value as any).uri) info.uri = (value as any).uri;
          console.log(`   ${key}: Object ->`, info);
        } else {
          console.log(`   ${key}: ${String(value)}`);
        }
      }
    } catch (e) {
      console.log("   No se pudo inspeccionar FormData", e);
    }

    // Usar FormData directo con los nombres que espera el backend
    const result = await this.postFormDataDirect<EventPass>(
      "event-pass",
      formData
    );
    // Invalidar caché de eventos para que otras vistas refresquen
    try {
      await storage.removeItem("events_cache");
    } catch (e) {
      console.warn("No se pudo limpiar events_cache:", e);
    }
    // Actualizar store en memoria para reflejar el nuevo evento inmediatamente
    try {
      const setAvailable = eventStore.getState().setAvailableEvents;
      const current = eventStore.getState().availableEvents || [];
      setAvailable([
        result as any as any,
        ...current.filter((e) => e.id !== (result as any).id),
      ]);
    } catch (e) {
      // no bloquear en caso de error
    }
    return result;
  }

  private async postFormDataDirect<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const token = await this.getAuthToken();
    const url = this.buildUrl(endpoint);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // NO establecer Content-Type - let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in postFormDataDirect:", error);
      throw error;
    }
  }

  private async putFormDataDirect<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const token = await this.getAuthToken();
    const url = this.buildUrl(endpoint);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // NO establecer Content-Type - let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in putFormDataDirect:", error);
      throw error;
    }
  }

  async updateEventPassFormData(
    eventId: string,
    formData: FormData
  ): Promise<EventPass> {
    const result = await this.putFormDataDirect<EventPass>(
      `event-pass/${eventId}`,
      formData
    );
    try {
      const fresh = await this.getEventPass(eventId);
      try {
        await storage.removeItem("events_cache");
      } catch (e) {
        console.warn("No se pudo limpiar events_cache:", e);
      }
      try {
        eventStore.getState().updateEvent(fresh as any);
      } catch (e) {}
      return fresh;
    } catch (err) {
      try {
        await storage.removeItem("events_cache");
      } catch (e) {
        console.warn("No se pudo limpiar events_cache:", e);
      }
      try {
        eventStore.getState().updateEvent(result as any);
      } catch (e) {}
      return result;
    }
  }

  async updateEventPass(
    eventId: string,
    eventData: Partial<CreateEventPassDto>
  ): Promise<EventPass> {
    const result = await this.put<EventPass>(
      `event-pass/${eventId}`,
      eventData
    );
    try {
      const fresh = await this.getEventPass(eventId);
      try {
        await storage.removeItem("events_cache");
      } catch (e) {
        console.warn("No se pudo limpiar events_cache:", e);
      }
      try {
        eventStore.getState().updateEvent(fresh as any);
      } catch (e) {}
      return fresh;
    } catch (err) {
      try {
        await storage.removeItem("events_cache");
      } catch (e) {
        console.warn("No se pudo limpiar events_cache:", e);
      }
      try {
        eventStore.getState().updateEvent(result as any);
      } catch (e) {}
      return result;
    }
  }

  async deleteEventPass(eventId: string): Promise<void> {
    try {
      await this.delete<void>(`event-pass/${eventId}`);
    } catch (err: any) {
      console.error("Error deleting event on API:", err);
      // Normalize error message for UI consumption
      const message =
        err?.message || err?.details?.message || "Error al eliminar el evento";
      const newErr = new Error(message);
      // Expose HTTP status when available so UI can react (e.g., 409 Conflict)
      (newErr as any).status =
        err?.status || err?.details?.statusCode || err?.statusCode || null;
      (newErr as any).raw = err;
      throw newErr;
    }

    // Solo al confirmar éxito, invalidamos caché y actualizamos el store
    try {
      await storage.removeItem("events_cache");
    } catch (e) {
      console.warn("No se pudo limpiar events_cache:", e);
    }
    try {
      const setAvailable = eventStore.getState().setAvailableEvents;
      const setAcquired = eventStore.getState().setAcquiredEvents;
      const available = eventStore.getState().availableEvents || [];
      const acquired = eventStore.getState().acquiredEvents || [];
      setAvailable(available.filter((e) => e.id !== eventId));
      setAcquired(
        acquired.filter((e) => e.id !== eventId && e.event_pass_id !== eventId)
      );
    } catch (e) {
      console.warn("Error updating eventStore after delete:", e);
    }
    return;
  }

  async getEventPassTypes(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: EventPassType[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.get<{
      data: EventPassType[];
      total: number;
      page: number;
      limit: number;
    }>(`event-pass/event-type?page=${page}&limit=${limit}`);
  }

  // =================== ORDERS MANAGEMENT ===================
  async getOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: AdminOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.get<any>(`orders?page=${page}&limit=${limit}`);

    // Normalizar respuesta - puede venir como array directo o como objeto con data
    if (Array.isArray(response)) {
      // Si es un array directo [orders, total]
      if (response.length === 2 && Array.isArray(response[0])) {
        return {
          data: response[0],
          total: response[1] || response[0].length,
          page,
          limit,
        };
      }
      // Si es un array de órdenes directamente
      return {
        data: response,
        total: response.length,
        page,
        limit,
      };
    }

    // Si viene como objeto con data y total
    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.total || response.data.length,
        page: response.page || page,
        limit: response.limit || limit,
      };
    }

    // Fallback
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<AdminOrder> {
    return this.put<AdminOrder>(`orders/${status}/${orderId}`, {});
  }

  // =================== ORGANIZATIONS MANAGEMENT ===================
  async getOrganizations(
    page: number = 1,
    limit: number = 10
  ): Promise<Organization[]> {
    return this.get<Organization[]>(`merchants?page=${page}&limit=${limit}`);
  }

  async toggleOrganizationStatus(
    orgId: string,
    isActive: boolean
  ): Promise<Organization> {
    if (!isActive) {
      // Disactivate organization
      return this.put<Organization>(`merchants/disactive/${orgId}`, {});
    } else {
      // Reactivate organization
      return this.put<Organization>(`merchants/activate/${orgId}`, {});
    }
  }

  // =================== DASHBOARD METRICS ===================
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Cargar métricas de forma más robusta y con manejo de errores individual
      const metrics: DashboardMetrics = {
        totalUsers: 0,
        totalProducts: 0,
        totalEvents: 0,
        totalOrders: 0,
        totalOrganizations: 0,
        revenueThisMonth: 0,
        activeEvents: 0,
      };

      // Cargar cada métrica individualmente para evitar que un error afecte a todas
      try {
        const usersResp = await this.getUsers(1, 1);
        metrics.totalUsers = usersResp.total || 0;
      } catch (error) {
        console.warn("Error loading users metrics:", error);
      }

      try {
        const productsResp = await this.getProducts(1, 1);
        metrics.totalProducts = productsResp.total || 0;
      } catch (error) {
        console.warn("Error loading products metrics:", error);
      }

      try {
        const eventsResp = await this.getEventPasses(1, 1);
        metrics.totalEvents = eventsResp.total || 0;
      } catch (error) {
        console.warn("Error loading events metrics:", error);
      }

      try {
        const ordersResp = await this.getOrders(1, 1);
        metrics.totalOrders = ordersResp.total || 0;
      } catch (error) {
        console.warn("Error loading orders metrics:", error);
      }

      try {
        const orgsResp = await this.getOrganizations(1, 1);
        metrics.totalOrganizations = Array.isArray(orgsResp)
          ? orgsResp.length
          : 0;
      } catch (error) {
        console.warn("Error loading organizations metrics:", error);
      }

      return metrics;
    } catch (error: any) {
      console.error("Error fetching dashboard metrics:", error);
      // Retornar métricas vacías en lugar de fallar completamente
      return {
        totalUsers: 0,
        totalProducts: 0,
        totalEvents: 0,
        totalOrders: 0,
        totalOrganizations: 0,
        revenueThisMonth: 0,
        activeEvents: 0,
      };
    }
  }
}

// Create singleton instance
export const adminApiService = new AdminApiService();
