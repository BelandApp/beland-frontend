/**
 * Product Service - Consolidated product and catalog operations
 * Handles product browsing, categories, and inventory management
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Product Types
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
  image_url?: string;
  category_id?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
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

class ProductServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    PRODUCTS: "products",
    CATEGORIES: "category",
    // TODO: Implement these endpoints in backend if needed
    // PRODUCT_INVENTORY: "products/inventory",
  } as const;

  /**
   * Get products with optional filtering and pagination
   */
  async getProducts(
    query: ProductQuery = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `${this.ENDPOINTS.PRODUCTS}?${queryString}`
      : this.ENDPOINTS.PRODUCTS;

    // The backend returns {products: BackendProduct[], total: number, page: number, limit: number}
    // We need to map this to our PaginatedResponse format and convert string numbers to actual numbers
    const response = await this.get<{
      products: Array<{
        id: string;
        name: string;
        description?: string;
        cost: string;
        price: string;
        price_becoin: string;
        image_url?: string;
        category_id: string;
        created_at: string;
        deleted_at?: string;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(endpoint);

    // Map backend products to frontend Product interface
    const mappedProducts: Product[] = response.products.map(
      (backendProduct) => ({
        id: backendProduct.id,
        name: backendProduct.name,
        description: backendProduct.description,
        price: parseFloat(backendProduct.price),
        cost: parseFloat(backendProduct.cost),
        image_url: backendProduct.image_url,
        category_id: backendProduct.category_id,
        is_active: !backendProduct.deleted_at, // If deleted_at is null, product is active
        created_at: backendProduct.created_at,
        updated_at: backendProduct.created_at, // Backend doesn't have updated_at, use created_at
      })
    );

    return {
      data: mappedProducts,
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
    };
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const backendProduct = await this.get<{
      id: string;
      name: string;
      description?: string;
      cost: string;
      price: string;
      price_becoin: string;
      image_url?: string;
      category_id: string;
      created_at: string;
      deleted_at?: string;
    }>(`${this.ENDPOINTS.PRODUCTS}/${id}`);

    // Map backend product to frontend Product interface
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      description: backendProduct.description,
      price: parseFloat(backendProduct.price),
      cost: parseFloat(backendProduct.cost),
      image_url: backendProduct.image_url,
      category_id: backendProduct.category_id,
      is_active: !backendProduct.deleted_at,
      created_at: backendProduct.created_at,
      updated_at: backendProduct.created_at,
    };
  }

  /**
   * Search products by name or description (using the main products endpoint)
   */
  async searchProducts(params: {
    query: string;
    page?: number;
    limit?: number;
    category_id?: string;
  }): Promise<PaginatedResponse<Product>> {
    // Use the main products endpoint with name filter
    const searchParams = {
      name: params.query,
      page: params.page,
      limit: params.limit,
      category_id: params.category_id,
    };
    return this.getProducts(searchParams);
  }

  /**
   * Get featured products (using the main products endpoint with limit)
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const response = await this.getProducts({ limit });
    return response.data;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const [categories] = await this.get<[Category[], number]>(
      this.ENDPOINTS.CATEGORIES
    );
    return categories;
  }

  /**
   * Get a single category by ID
   */
  async getCategory(id: string): Promise<Category> {
    return this.get<Category>(`${this.ENDPOINTS.CATEGORIES}/${id}`);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    query: Omit<ProductQuery, "category_id"> = {}
  ): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ ...query, category_id: categoryId });
  }

  // TODO: Implement inventory endpoints in backend
  /**
   * Get product inventory information
   * NOTE: This endpoint doesn't exist in the current backend
   */
  /*
  async getProductInventory(productId: string): Promise<ProductInventory> {
    return this.get<ProductInventory>(
      `${this.ENDPOINTS.PRODUCT_INVENTORY}/${productId}`
    );
  }
  */

  /**
   * Get inventory for multiple products
   * NOTE: This endpoint doesn't exist in the current backend
   */
  /*
  async getBulkInventory(productIds: string[]): Promise<ProductInventory[]> {
    return this.post<ProductInventory[]>(
      `${this.ENDPOINTS.PRODUCT_INVENTORY}/bulk`,
      { product_ids: productIds }
    );
  }
  */

  /**
   * Check if products are available for purchase
   */
  async checkAvailability(
    items: { product_id: string; quantity: number }[]
  ): Promise<{
    available: boolean;
    unavailable_items: string[];
    inventory: ProductInventory[];
  }> {
    return this.post(`products/check-availability`, { items });
  }

  // Admin methods (require proper permissions)

  /**
   * Create a new product (admin only)
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    return this.post<Product>(this.ENDPOINTS.PRODUCTS, data);
  }

  /**
   * Update a product (admin only)
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    return this.patch<Product>(`${this.ENDPOINTS.PRODUCTS}/${id}`, data);
  }

  /**
   * Delete a product (admin only)
   */
  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.PRODUCTS}/${id}`
    );
  }

  /**
   * Upload product image (admin only)
   */
  async uploadProductImage(
    productId: string,
    imageFile: FormData
  ): Promise<{ image_url: string }> {
    return this.request<{ image_url: string }>(`products/${productId}/image`, {
      method: "POST",
      body: imageFile,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  /**
   * Update product inventory (admin only)
   */
  async updateInventory(
    productId: string,
    data: {
      quantity_change: number;
      operation: "add" | "subtract" | "set";
      reason?: string;
    }
  ): Promise<ProductInventory> {
    return this.patch<ProductInventory>(
      `products/${productId}/inventory`,
      data
    );
  }
}

// Export singleton instance
export const ProductService = new ProductServiceClass();
