export interface PaymentResource {
  id: string;
  resource_name: string;
  resource_desc: string;
  resource_quanity: number;
  resource_discount: number;
}

export interface Redemption {
  id: string;
  type: string;
  [key: string]: any;
}

export interface UserResource {
  quantity?: number;
  quantity_redeemed?: number;

  resource?: {
    discount?: number;
    resource_discount?: number;

    [key: string]: any;
  };
}

/**
 * DTO recibido desde el backend.
 * Puede venir incompleto.
 */
export interface RawPaymentData {
  wallet_id?: string;

  img_url?: string;

  full_name?: string;

  commerce_name?: string;

  amount?: string | number;

  amount_to_payment_id?: string | null;

  message?: string | null;

  resource?: PaymentResource[];

  redemptions?: Redemption[];

  user_resources?: UserResource[];

  appliedRedemption?: any;

  [key: string]: any;
}

/**
 * Modelo que usa la aplicación.
 * Cuando existe, es válido.
 */
export interface PaymentData {
  wallet_id: string;

  img_url?: string;

  full_name?: string;

  commerce_name?: string;

  amount: number;

  amount_to_payment_id: string | null;

  message?: string;

  resource: PaymentResource[];

  redemptions: Redemption[];

  user_resources: UserResource[];

  appliedRedemption?: any;
}
