# Guía de Migración de Servicios API

## Resumen

Este documento explica cómo migrar de los servicios API fragmentados actuales al nuevo sistema consolidado.

## Servicios Consolidados Creados ✅

### Estructura Nueva

```
src/services/
├── core/
│   ├── ApiService.ts     # Clase base con retry, timeout, auth
│   └── index.ts          # Exports consolidados
├── UserApiService.ts     # Gestión de usuarios consolidada
├── ProductApiService.ts  # Productos y categorías
├── CartApiService.ts     # Carrito de compras
└── OrderApiService.ts    # Órdenes y tracking
```

### Path Alias Configurado

```json
"@api/*": ["services/core/*"]
```

## Principales Mejoras

### 1. CoreApiService Base

- ✅ **Retry automático** con backoff exponencial
- ✅ **Timeout configurable** (30s por defecto)
- ✅ **Autenticación automática** desde AsyncStorage/localStorage
- ✅ **Manejo de errores unificado** con tipos TypeScript
- ✅ **Logging centralizado** para debugging
- ✅ **Soporte para AbortController** para cancelar requests

### 2. Servicios Consolidados

#### UserService (UserApiService.ts)

**Unifica**: `userService.ts`, `authService.ts`, `resourceService.ts`

```typescript
// ✅ Métodos disponibles
-getCurrentUser() -
  getUserProfile() -
  updateProfile() -
  getUserResources() -
  getUserBalance() -
  getUserActivity(pagination) -
  uploadAvatar() -
  refreshSession() -
  deleteAccount();
```

#### ProductService (ProductApiService.ts)

**Unifica**: `productsService.ts`, `categoryService.ts`

```typescript
// ✅ Métodos disponibles
-getProducts(query, pagination) -
  getProduct(id) -
  searchProducts() -
  getFeaturedProducts() -
  getCategories() -
  getProductsByCategory() -
  getProductInventory() -
  checkAvailability() -
  // Admin methods
  createProduct(),
  updateProduct(),
  deleteProduct();
```

#### CartService (CartApiService.ts)

**Unifica**: `cartService.ts` + funcionalidades extendidas

```typescript
// ✅ Métodos disponibles
-getCart() - addToCart(),
  updateCartItem(),
  removeFromCart() - applyCoupon(),
  removeCoupon(),
  validateCoupon() -
    syncCart() - // Para offline/online sync
    getRecommendations() -
    validateCart() - // Check availability & prices
    addMultipleItems() -
    estimateShipping();
```

#### OrderService (OrderApiService.ts)

**Unifica**: `orderService.ts`, `paymentTypesService.ts`

```typescript
// ✅ Métodos disponibles
-getOrders(query, pagination) -
  getOrder(id) -
  createOrder() -
  cancelOrder() -
  getOrderTracking() -
  getOrderStats() -
  reorder() -
  processPayment() -
  requestRefund() -
  rateOrder();
```

## Cómo Migrar

### 1. Actualizar Imports

```typescript
// ❌ Antes (servicios fragmentados)
import { fetchCurrentUser } from "@services/userService";
import { getProducts } from "@services/productsService";
import { addToCart } from "@services/cartService";

// ✅ Después (servicios consolidados)
import { UserService, ProductService, CartService } from "@api";
// O específicos:
import { UserService } from "@api/UserApiService";
```

### 2. Actualizar Llamadas a API

#### Ejemplo: User Profile

```typescript
// ❌ Antes
const user = await fetchCurrentUser(token);

// ✅ Después
const user = await UserService.getCurrentUser();
// El token se maneja automáticamente
```

#### Ejemplo: Products con Filtros

```typescript
// ❌ Antes
const products = await productsService.getProducts({
  page: 1,
  limit: 10,
  category_id: "123",
});

// ✅ Después
const products = await ProductService.getProducts({
  page: 1,
  limit: 10,
  category_id: "123",
});
// Includes TypeScript types y error handling
```

#### Ejemplo: Cart Operations

```typescript
// ❌ Antes
await cartService.addItem(productId, quantity);
await cartService.updateQuantity(itemId, newQuantity);

// ✅ Después
await CartService.addToCart({ product_id: productId, quantity });
await CartService.updateCartItem(itemId, { quantity: newQuantity });
// Unified interface with validation
```

### 3. Manejo de Errores Mejorado

```typescript
// ✅ Nuevo manejo de errores
try {
  const user = await UserService.getCurrentUser();
} catch (error) {
  if (error.status === 401) {
    // Token expired, redirect to login
  } else if (error.status === 404) {
    // User not found
  } else {
    // Generic error handling
    console.error("API Error:", error.message);
  }
}
```

## Funcionalidades Nuevas

### 1. Retry Automático

```typescript
// Los requests se reintentan automáticamente en:
- Network timeouts
- Server errors (5xx)
- Connection failures
// Con backoff exponencial: 1s, 2s, 3s
```

### 2. Paginación Unificada

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 3. Cache Ready

```typescript
// Estructura preparada para implementar cache:
- Request deduplication
- Response caching
- Offline support
```

## Compatibilidad

### Legacy Support

Los servicios antiguos siguen funcionando durante la migración:

- `api.ts` mantiene `apiRequest()` para compatibilidad
- Servicios existentes no se rompen
- Migración gradual recomendada

### Hooks y Stores

Los hooks existentes pueden usar los nuevos servicios:

```typescript
// En useProducts.ts
import { ProductService } from "@api";

export const useProducts = () => {
  const [products, setProducts] = useState([]);

  const loadProducts = async (query) => {
    const result = await ProductService.getProducts(query);
    setProducts(result.data);
  };

  return { products, loadProducts };
};
```

## Próximos Pasos

1. ✅ Crear servicios consolidados base
2. Migrar hooks para usar nuevos servicios
3. Actualizar stores Zustand
4. Eliminar servicios legacy duplicados
5. Implementar cache layer

## Beneficios Obtenidos

- ✅ **52 servicios → 4 servicios principales** + CoreApiService
- ✅ **Retry automático** y timeout handling
- ✅ **TypeScript robusto** con interfaces completas
- ✅ **Error handling unificado**
- ✅ **Logging centralizado** para debugging
- ✅ **Auth automática** sin manual token handling
- ✅ **Preparado para cache** y offline support
- ✅ **APIs más consistentes** y fáciles de usar
