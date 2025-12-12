import { io, Socket } from "socket.io-client";

export interface RespSocket {
  wallet_id: string;
  message: string;
  amount: number;
  success: boolean;
  amount_payment_id_deleted?: string | null;
  noHidden: boolean;
  resource_name?: string;
  resource_quantity?: number;
  applied_redemption?: {
    id: string;
    code: string;
    discount_value: number;
    original_amount: number;
    discounted_amount: number;
  };
  becoins_used?: number;
  transaction_type?: "free_entry" | "paid_entry" | "redemption_applied";
}

export class SocketService {
  private socket: Socket | null = null;
  private static _instance: SocketService | null = null;
  private connecting: boolean = false;
  private lastToken: string | null = null;
  private lastAttemptToken: string | null = null;
  private lastAttemptAt: number = 0;

  static getInstance() {
    if (!this._instance) this._instance = new SocketService();
    return this._instance;
  }

  connect(token: string) {
    // Normalize token to avoid false positives (whitespace, surrounding quotes)
    const normalized = token
      ? String(token).trim().replace(/^"|"$/g, "")
      : null;
    if (!normalized) {
      return;
    }

    // Throttle repeated connect attempts with same token within short window
    const now = Date.now();
    const THROTTLE_MS = 10000; // 10s
    if (
      this.lastAttemptToken === normalized &&
      now - this.lastAttemptAt < THROTTLE_MS
    ) {
      return;
    }

    // If already connected (or connecting) with same token, skip
    if (
      this.socket &&
      this.lastToken === normalized &&
      (this.socket.connected || this.connecting)
    ) {
      return;
    }

    // If token changed, disconnect first
    if (this.socket && this.lastToken !== normalized) this.disconnect();

    // track attempt time/token without logging sensitive info
    this.lastAttemptToken = normalized;
    this.lastAttemptAt = now;

    // Build WS URL (remove /api suffix if present)
    let wsUrl =
      process.env.EXPO_PUBLIC_WS_URL ||
      "https://beland-backend-266662044893.us-east1.run.app";
    if (wsUrl.endsWith("/api")) wsUrl = wsUrl.slice(0, -4);

    this.connecting = true;
    this.socket = io(wsUrl, {
      auth: { token: normalized },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      this.lastToken = normalized;
      this.connecting = false;
    });

    this.socket.on("connect_error", (err: any) => {
      console.error("[SocketService] Error de conexión:", err?.message || err);
      this.connecting = false;
    });

    this.socket.on("disconnect", () => {
      this.connecting = false;
    });
  }

  onPaymentSuccess(
    callback: (data: { amount: number; [key: string]: any }) => void
  ) {
    this.socket?.on("payment-success", callback);
  }

  onBalanceUpdated(callback: (data: RespSocket) => void) {
    this.socket?.on("balanceUpdated", callback);
  }

  onTransactionReceived(callback: (data: RespSocket) => void) {
    this.socket?.on("transactionReceived", callback);
  }

  onOrderCreated(callback: (data: any) => void) {
    this.socket?.on("orderCreated", callback);
  }

  onOrderUpdated(callback: (data: any) => void) {
    this.socket?.on("orderUpdated", callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    try {
      this.socket?.disconnect();
    } finally {
      this.socket = null;
      this.connecting = false;
      this.lastToken = null;
    }
  }
}
