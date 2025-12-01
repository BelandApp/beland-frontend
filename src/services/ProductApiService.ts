/**
 * Product Service - Consolidated product and catalog operations
 * Handles product browsing, categories, and inventory management
 */

import { CreateProductDto, Product, ProductInventory, ProductQuery, UpdateProductDto, Category } from "src/types";
import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Product Types

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
        category?: {
          id: string;
          name: string;
          description?: string;
          image_url?: string;
        };
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
        price_becoin: backendProduct.price_becoin
          ? parseFloat(backendProduct.price_becoin)
          : undefined,
        image_url: backendProduct.image_url,
        category_id: backendProduct.category_id,
        category: backendProduct.category
          ? {
              id: backendProduct.category.id,
              name: backendProduct.category.name,
              description: backendProduct.category.description,
              image_url: backendProduct.category.image_url,
              is_active: true,
            }
          : undefined,
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
      category?: {
        id: string;
        name: string;
        description?: string;
        image_url?: string;
      };
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
      price_becoin: backendProduct.price_becoin
        ? parseFloat(backendProduct.price_becoin)
        : undefined,
      image_url: backendProduct.image_url,
      category_id: backendProduct.category_id,
      category: backendProduct.category
        ? {
            id: backendProduct.category.id,
            name: backendProduct.category.name,
            description: backendProduct.category.description,
            image_url: backendProduct.category.image_url,
            is_active: true,
          }
        : undefined,
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
  async getCategories(): Promise<PaginatedResponse<Category>> {
    const response = await this.get<any>(this.ENDPOINTS.CATEGORIES);

    // Handle different response structures from backend
    let categories: Category[] = [];
    let total = 0;

    if (Array.isArray(response)) {
      // [categories, total] tuple or direct array
      if (response.length === 2 && Array.isArray(response[0])) {
        categories = response[0];
        total = response[1] || categories.length;
      } else {
        categories = response;
        total = categories.length;
      }
    } else if (response && typeof response === "object") {
      // Object with data property
      if (Array.isArray(response.data)) {
        categories = response.data;
        total = response.total || categories.length;
      } else if (response.data && Array.isArray(response.data.data)) {
        categories = response.data.data;
        total = response.data.total || categories.length;
      } else if (Array.isArray(response.categories)) {
        categories = response.categories;
        total = response.total || categories.length;
      }
    }

    return {
      data: categories,
      total: total,
      page: 1,
      limit: total,
      totalPages: 1,
    };
  }

  /**
   * Get a single category by ID
   */
  async getCategory(id: string): Promise<Category> {
    return this.get<Category>(`${this.ENDPOINTS.CATEGORIES}/${id}`);
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(data: { name: string }): Promise<Category> {
    return this.post<Category>(this.ENDPOINTS.CATEGORIES, data);
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
