export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  price_becoin?: number;
  image_url?: string;
  category_id?: string;
  category?: Category;
  is_active: boolean;
  inventory_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  product_count?: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "created_at";
  order?: "ASC" | "DESC";
  category_id?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  cost: number;
  price: number;
  price_becoin?: number;
  image_url?: string;
  category_id?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  price_becoin?: number;
  image_url?: string;
  category_id?: string;
  is_active?: boolean;
}

export interface ProductInventory {
  product_id: string;
  available_count: number;
  reserved_count: number;
  total_count: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
}
