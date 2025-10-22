import { io, Socket } from "socket.io-client";

export interface RespSocket {
  wallet_id: string;
  message: string;
  amount: number;
  success: boolean;
  amount_payment_id_deleted?: string | null;
  noHidden: boolean;
  // Datos adicionales de la entrada y cantidad
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

  connect(token: string) {
    // Para WebSockets, necesitamos la URL base sin /api
    let wsUrl =
      process.env.EXPO_PUBLIC_WS_URL ||
      "https://beland-backend-266662044893.us-east1.run.app";

    // Si la URL termina en /api, la removemos para WebSockets
    if (wsUrl.endsWith("/api")) {
      wsUrl = wsUrl.slice(0, -4);
    }

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[SocketService] Conectado exitosamente");
    });

    this.socket.on("connect_error", (err) => {
      console.error("[SocketService] Error de conexión:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("[SocketService] Desconectado:", reason);
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

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
