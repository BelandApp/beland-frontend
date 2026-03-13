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
  type: {
    code: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  amount_becoin: number;
  post_balance: string;
  reference: string;
  created_at: string;
  status: {
    id: string;
    code: string;
    name: string;
    color: string;
    description: string;
  };
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
