export * from "./groupStorage";
export * from "./locationService";
export * from "./addressService";

// API Services
export { UserService } from "./UserApiService";
export { ProductService } from "./ProductApiService";
export { CartService } from "./cart/CartApiService";
export { OrderService } from "./OrderApiService";
export { GroupService } from "./GroupApiService";
export { PaymentService } from "./PaymentApiService";
export { ResourceService } from "./ResourceApiService";
export { WalletService } from "./WalletApiService";
export { WithdrawService } from "./withdrawService";
export { organizationService } from "./OrganizationApiService";
export { ServicesApiService } from "./ServicesApiService";

// Other services
export * from "./auth";
// Do not re-export the legacy API implementation; keep helper exports explicit
export { getBackendErrorMessage } from "./helpers";
export * from "./supabaseClient";
export * from "./SocketService";
export * from "./geocodingService";
export * from "./instagramService";
export * from "./GroupApiService";

// Core services - export specific items to avoid conflicts
export { CoreApiService } from "./core";
