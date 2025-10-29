import {
  CoreApiService,
  PaginatedResponse,
  ApiResponse,
} from "./core/ApiService";

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
  image_url?: string;
  event_place?: string;
  event_city?: string;
  event_date: string;
  price_becoin: number;
  limit_tickets: number;
  sold_tickets: number;
  is_active: boolean;
  created_by_id: string;
  created_at: string;
}

export interface CreateEventPassDto {
  code: string;
  name: string;
  description?: string;
  type_id: string;
  event_place?: string;
  event_city?: string;
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
    return this.put<EventPass>(endpoint, {});
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

    // Compatibilidad backend: si solo hay una imagen y el backend espera always an images_urls array,
    // enviamos la misma imagen también en images_urls para que files.images_urls exista como array
    // (esto evita errores en backends que no manejan undefined en files.images_urls).
    if (mainImage && additionalImages.length === 0) {
      // Si el usuario originalmente no envió images_urls como array con elementos, duplicamos
      const hadImagesUrlsArray =
        Array.isArray((eventData as any).images_urls) &&
        (eventData as any).images_urls.length > 0;
      if (!hadImagesUrlsArray) {
        formData.append("images_urls", mainImage);
        console.log(
          `📎 Compatibilidad: duplicando imagen en images_urls para backend (single image case)`
        );
      }
    }

    // Debugging: Inspeccionar contenido del FormData
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
    return this.postFormDataDirect("event-pass", formData);
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

  async updateEventPass(
    eventId: string,
    eventData: Partial<CreateEventPassDto>
  ): Promise<EventPass> {
    return this.put<EventPass>(`event-pass/${eventId}`, eventData);
  }

  async deleteEventPass(eventId: string): Promise<void> {
    return this.delete<void>(`event-pass/${eventId}`);
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
  async getOrders(page: number = 1, limit: number = 10): Promise<AdminOrder[]> {
    return this.get<AdminOrder[]>(`orders?page=${page}&limit=${limit}`);
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
    return this.get<Organization[]>(
      `organizations?page=${page}&limit=${limit}`
    );
  }

  async toggleOrganizationStatus(
    orgId: string,
    isActive: boolean
  ): Promise<Organization> {
    if (!isActive) {
      // Disactivate organization
      return this.put<Organization>(`organizations/disactive/${orgId}`, {});
    } else {
      // Reactivate organization
      return this.put<Organization>(`organizations/${orgId}`, {
        is_active: true,
      });
    }
  }

  // =================== DASHBOARD METRICS ===================
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Consultar la primera página solo para obtener el total de cada entidad
      const [usersResp, productsResp, eventsResp, ordersResp, orgsResp] =
        await Promise.all([
          this.getUsers(1, 1),
          this.getProducts(1, 1),
          this.getEventPasses(1, 1),
          this.getOrders(1, 1),
          this.getOrganizations(1, 1),
        ]);

      const metrics: DashboardMetrics = {
        totalUsers: usersResp.total || 0,
        totalProducts: productsResp.total || 0,
        totalEvents: eventsResp.total || 0,
        totalOrders: Array.isArray(ordersResp) ? ordersResp.length : 0,
        totalOrganizations: Array.isArray(orgsResp) ? orgsResp.length : 0,
        revenueThisMonth: 0, // This needs backend calculation
        activeEvents: 0, // This needs backend calculation
      };

      return metrics;
    } catch (error: any) {
      throw new Error("Error fetching dashboard metrics");
    }
  }
}

// Create singleton instance
export const adminApiService = new AdminApiService();
