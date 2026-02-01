export interface WalletData {
  balance: number;
  becoin_green: number;
  becoin_orange: number;
  locked_balance: number;
  alias: string;
  estimatedValue: string;
}

export interface WalletAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color?: string;
  bgColor?: string;
  backgroundColor?: string; // Deprecated, usar bgColor
  onPress?: () => void;
}

export interface Transaction {
  id: string;
  type:
    | "transferencia"
    | "receive"
    | "recarga"
    | "canje"
    | "pago"
    | "collection";
  // Legacy: `amount` (numeric), older `amount_beicon`, and new `amount_becoin`
  type_description: string;
  amount: number;
  amount_beicon: number;
  amount_becoin?: number;
  description: string;
  date: string;
  status: "exitoso" | "pendiente" | "error";
  from?: string;
  to?: string;
}

export interface FRSData {
  title: string;
  rating: string;
  amount: string;
  rate: string;
  details: string;
}

export * from "./paymentMethods";
