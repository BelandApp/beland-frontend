/**
 * Core API Services Index
 * Consolidated exports for all new API services
 */

// Core service
export { CoreApiService, API_CONFIG } from "./ApiService";
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  RequestOptions,
} from "./ApiService";

// User service
export { UserService } from "../UserApiService";
export type {
  User,
  UserProfile,
  UpdateUserDto,
  UserResource,
  UserActivity,
} from "../UserApiService";

// Product service
export { ProductService } from "../ProductApiService";
// Re-export product-related types from central types to avoid circular re-exports
export type {
  Product,
  Category,
  ProductQuery,
  CreateProductDto,
  UpdateProductDto,
  ProductInventory,
} from "src/types/Products";

// Cart service
export { CartService } from "../cart/CartApiService";
export type {
  Cart,
  CartItem,
  AddToCartDto,
  UpdateCartItemDto,
  ApplyCouponDto,
  CouponInfo,
  CartSummary,
} from "../cart/CartApiService";

// Order service
export { OrderService } from "../OrderApiService";
export type {
  Order,
  OrderItem,
  OrderAddress,
  CreateOrderDto,
  OrderQuery,
  OrderTracking,
  OrderStats,
} from "../OrderApiService";

// Group service
export { GroupService } from "../GroupApiService";
export type {
  Group,
  GroupMember,
  GroupOrder,
  CreateGroupDto,
  UpdateGroupDto,
  InviteToGroupDto,
  GroupQuery,
} from "../GroupApiService";

// Payment service
export { PaymentService } from "../PaymentApiService";
export type {
  PaymentType,
  PaymentMethod,
  Transaction,
  CreatePaymentDto,
  ProcessPaymentDto,
  WithdrawDto,
  TransactionQuery,
  PaymentMode,
  UserBalance,
} from "../PaymentApiService";

// Resource service
export { ResourceService } from "../ResourceApiService";
export type {
  ResourceType,
  RecyclingTransaction,
  UserResourceSummary,
  CreateRecyclingTransactionDto,
  RecyclingQuery,
  EnvironmentalImpact,
  RecyclingGoal,
} from "../ResourceApiService";

// Wallet service
export { WalletService } from "../WalletApiService";
export type {
  Wallet,
  RechargeRequest,
  TransferRequest,
  WalletCreateRequest,
} from "../WalletApiService";

// Withdraw service
export { WithdrawService } from "./../";
export type {
  WithdrawAccount,
  WithdrawAccountType,
  CreateWithdrawAccountRequest,
  UpdateWithdrawAccountRequest,
  WithdrawRequest,
  UserWithdraw,
} from "../";

// Transaction service
export { TransactionService } from "../TransactionApiService";
export type {
  Transaction as TransactionType,
  RecentRecipient,
} from "../TransactionApiService";
