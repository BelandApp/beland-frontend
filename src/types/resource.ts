export interface Resource {
  id: string;
  resource_name: string;
  resource_desc: string;
  resource_img: string;
  resource_price: number; // Precio en USD
  resource_quanity: number; // Stock disponible
  resource_discount: number; // Descuento en porcentaje
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceCategory {
  id: string;
  category_name: string;
  category_desc: string;
  category_img?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourcesResponse {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesResponse {
  categories: ResourceCategory[];
}

// Para filtros y paginación
export interface ResourceFilters {
  category_id?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Tipos para recursos de usuario (descuentos y promociones)
export interface UserResourceInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  url_image?: string;
  becoin_value: number;
  discount: number;
  limit_user: number;
  limit_app: number;
  used_account: number;
  is_expired: boolean;
  expires_at: Date | null;
  created_at: Date;
  resource_type_id: string;
  user_commerce_id: string;
}

export interface UserInfo {
  id: string;
  full_name: string;
  email: string;
  profile_picture_url?: string;
}

export interface UserResource {
  id: string;
  user_id: string;
  resource_id: string;
  quantity: number;
  quantity_redeemed: number;
  hash_id: string;
  qr_code?: string;
  is_redeemed: boolean;
  redeemed_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
  resource: UserResourceInfo | null;
  user: UserInfo | null;
}

export interface UserResourcesResponse {
  userResources: UserResource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
