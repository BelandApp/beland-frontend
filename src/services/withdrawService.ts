import { apiRequest } from "./api";

// Tipos para cuentas de retiro
export interface WithdrawAccount {
  id: string;
  user_id: string;
  withdraw_account_type_id: string;
  owner_name: string;
  cbu?: string;
  alias?: string;
  provider?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  withdraw_account_type: WithdrawAccountType; // Campo principal del backend
  // Mantenemos type para compatibilidad hacia atrás
  type?: WithdrawAccountType;
}

export interface WithdrawAccountType {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWithdrawAccountRequest {
  owner_name: string;
  withdraw_account_type_id: string;
  cbu?: string;
  alias?: string;
  provider?: string;
  phone?: string;
}

export interface UpdateWithdrawAccountRequest {
  owner_name?: string;
  cbu?: string;
  alias?: string;
  provider?: string;
  phone?: string;
}

export interface WithdrawRequest {
  amountBecoin: number;
  withdraw_account_id: string;
}

export interface UserWithdraw {
  id: string;
  user_id: string;
  withdraw_account_id: string;
  amount_becoin: number;
  amount_usd: number;
  status: "pending" | "completed" | "failed";
  reference?: string;
  observation?: string;
  created_at: string;
  updated_at: string;
  withdraw_account: WithdrawAccount;
}

class WithdrawService {
  // ==================== GESTIÓN DE CUENTAS DE RETIRO ====================

  /**
   * Obtener todas las cuentas de retiro del usuario autenticado
   */
  async getWithdrawAccounts(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    accounts: WithdrawAccount[];
    total: number;
  }> {
    try {
      console.log("🏦 Obteniendo cuentas de retiro...");
      const response = await apiRequest(
        `/withdraw-account?page=${page}&limit=${limit}`,
        {
          method: "GET",
        }
      );

      // El backend devuelve un array [accounts, total]
      if (Array.isArray(response) && response.length === 2) {
        return {
          accounts: response[0] || [],
          total: response[1] || 0,
        };
      }

      // Fallback si la respuesta no tiene el formato esperado
      return {
        accounts: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
      };
    } catch (error) {
      console.error("❌ Error obteniendo cuentas de retiro:", error);
      throw error;
    }
  }

  /**
   * Obtener una cuenta de retiro específica por ID
   */
  async getWithdrawAccount(id: string): Promise<WithdrawAccount> {
    try {
      console.log(`🏦 Obteniendo cuenta de retiro ${id}...`);
      const response = await apiRequest(`/withdraw-account/${id}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo cuenta de retiro ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva cuenta de retiro
   */
  async createWithdrawAccount(
    data: CreateWithdrawAccountRequest
  ): Promise<WithdrawAccount> {
    try {
      console.log("🏦 Creando nueva cuenta de retiro:", data);
      const response = await apiRequest("/withdraw-account", {
        method: "POST",
        body: JSON.stringify(data),
      });
      console.log("✅ Cuenta de retiro creada exitosamente:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error creando cuenta de retiro:", error);

      // Error específico de migración de base de datos
      if (
        error?.message?.includes('column "is_active"') ||
        error?.message?.includes("does not exist")
      ) {
        console.error("🔧 SOLUCIÓN PARA EL BACKEND:");
        console.error(
          "La tabla 'withdraw_accounts' necesita la columna 'is_active'."
        );
        console.error(
          "Ejecutar: ALTER TABLE withdraw_accounts ADD COLUMN is_active BOOLEAN DEFAULT false;"
        );
        console.error(
          "O crear una migración TypeORM para agregar esta columna."
        );
      }

      throw error;
    }
  }

  /**
   * Actualizar una cuenta de retiro existente
   */
  async updateWithdrawAccount(
    id: string,
    data: UpdateWithdrawAccountRequest
  ): Promise<WithdrawAccount> {
    try {
      console.log(`🏦 Actualizando cuenta de retiro ${id}:`, data);
      const response = await apiRequest(`/withdraw-account/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      console.log("✅ Cuenta de retiro actualizada exitosamente:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando cuenta de retiro ${id}:`, error);
      throw error;
    }
  }

  /**
   * Desactivar una cuenta de retiro
   */
  async deactivateWithdrawAccount(id: string): Promise<void> {
    try {
      console.log(`🏦 Desactivando cuenta de retiro ${id}...`);
      await apiRequest(`/withdraw-account/disactive/${id}`, {
        method: "PUT",
      });
      console.log("✅ Cuenta de retiro desactivada exitosamente");
    } catch (error) {
      console.error(`❌ Error desactivando cuenta de retiro ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar permanentemente una cuenta de retiro
   */
  async deleteWithdrawAccount(id: string): Promise<void> {
    try {
      console.log(`🗑️ Eliminando cuenta de retiro ${id}...`);
      await apiRequest(`/withdraw-account/${id}`, {
        method: "DELETE",
      });
      console.log("✅ Cuenta de retiro eliminada exitosamente");
    } catch (error) {
      console.error(`❌ Error eliminando cuenta de retiro ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reactivar una cuenta de retiro
   */
  async activateWithdrawAccount(id: string): Promise<void> {
    try {
      console.log(`🏦 Reactivando cuenta de retiro ${id}...`);
      await apiRequest(`/withdraw-account/active/${id}`, {
        method: "PUT",
      });
      console.log("✅ Cuenta de retiro reactivada exitosamente");
    } catch (error) {
      console.error(`❌ Error reactivando cuenta de retiro ${id}:`, error);
      throw error;
    }
  }

  // ==================== TIPOS DE CUENTA ====================

  /**
   * Obtener todos los tipos de cuenta disponibles
   */
  async getWithdrawAccountTypes(): Promise<WithdrawAccountType[]> {
    try {
      console.log("🏦 Obteniendo tipos de cuenta...");
      const response = await apiRequest("/withdraw-account-type", {
        method: "GET",
      });

      // El backend puede devolver un array [types, total] o solo types
      if (Array.isArray(response) && response.length === 2) {
        return response[0] || [];
      }

      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("❌ Error obteniendo tipos de cuenta:", error);
      throw error;
    }
  }

  // ==================== FLUJO DE RETIRO ====================

  /**
   * Solicitar un retiro de BeCoins a una cuenta bancaria
   */
  async requestWithdraw(data: WithdrawRequest): Promise<any> {
    try {
      console.log("💰 Solicitando retiro:", data);

      // Validar datos
      if (!data.amountBecoin || data.amountBecoin <= 0) {
        throw new Error("El monto debe ser mayor a 0");
      }

      if (!data.withdraw_account_id) {
        throw new Error("Debe seleccionar una cuenta de destino");
      }

      const response = await apiRequest("/user-withdraw/withdraw", {
        method: "POST",
        body: JSON.stringify(data),
      });

      console.log("✅ Retiro solicitado exitosamente:", response);
      return response;
    } catch (error) {
      console.error("❌ Error solicitando retiro:", error);
      throw error;
    }
  }

  /**
   * Obtener historial de retiros del usuario
   */
  async getWithdrawHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    withdraws: UserWithdraw[];
    total: number;
  }> {
    try {
      console.log("📜 Obteniendo historial de retiros...");
      const response = await apiRequest(
        `/user-withdraw?page=${page}&limit=${limit}`,
        {
          method: "GET",
        }
      );

      // El backend puede devolver un array [withdraws, total] o solo withdraws
      if (Array.isArray(response) && response.length === 2) {
        return {
          withdraws: response[0] || [],
          total: response[1] || 0,
        };
      }

      return {
        withdraws: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
      };
    } catch (error) {
      console.error("❌ Error obteniendo historial de retiros:", error);
      throw error;
    }
  }

  // ==================== HELPERS ====================

  /**
   * Validar datos de cuenta bancaria
   */
  validateAccountData(
    data: CreateWithdrawAccountRequest | UpdateWithdrawAccountRequest
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      "owner_name" in data &&
      (!data.owner_name || data.owner_name.trim().length < 2)
    ) {
      errors.push("El nombre del propietario es requerido");
    }

    if ("cbu" in data && data.cbu && data.cbu.length !== 22) {
      errors.push("El CBU debe tener exactamente 22 dígitos");
    }

    if ("alias" in data && data.alias && data.alias.trim().length < 6) {
      errors.push("El alias debe tener al menos 6 caracteres");
    }

    if ("phone" in data && data.phone && data.phone.length < 10) {
      errors.push("El teléfono debe tener al menos 10 dígitos");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formatear número de cuenta para mostrar (ocultar dígitos intermedios)
   */
  formatAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 8) {
      return accountNumber;
    }

    const first4 = accountNumber.slice(0, 4);
    const last4 = accountNumber.slice(-4);
    const middle = "*".repeat(Math.max(0, accountNumber.length - 8));

    return `${first4}${middle}${last4}`;
  }

  /**
   * Obtener icono según el tipo de cuenta
   */
  getAccountTypeIcon(accountType: string): string {
    switch (accountType.toLowerCase()) {
      case "ahorros":
      case "savings":
        return "💰";
      case "corriente":
      case "checking":
        return "🏦";
      case "payphone":
        return "💳";
      default:
        return "🏦";
    }
  }

  /**
   * Función de diagnóstico para verificar el estado del servicio
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // Intentar obtener tipos de cuenta para verificar conectividad
      await this.getWithdrawAccountTypes();
      return {
        status: "OK",
        message: "WithdrawService está funcionando correctamente",
      };
    } catch (error) {
      console.error("❌ WithdrawService health check failed:", error);
      return {
        status: "ERROR",
        message: `WithdrawService no está disponible: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }
}

export const withdrawService = new WithdrawService();

// Log de inicialización
console.log("🏦 WithdrawService inicializado correctamente");

// Exportar también la clase para casos especiales
export { WithdrawService };
