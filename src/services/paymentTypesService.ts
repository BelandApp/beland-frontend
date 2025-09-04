import { apiRequest } from "./api";

// Types para tipos de pago
export interface PaymentType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  allowedModes: PaymentMode[];
  minimumAmount?: number;
  maximumAmount?: number;
  processingFee?: number;
  created_at: Date;
  updated_at: Date;
}

export type PaymentMode = "FULL" | "SPLIT" | "EQUAL_SPLIT";

export interface PaymentTypesResponse {
  payment_types: PaymentType[];
  total: number;
}

export interface PaymentTypeQuery {
  active_only?: boolean;
  mode?: PaymentMode;
}

class PaymentTypesService {
  // Obtener todos los tipos de pago
  async getPaymentTypes(
    query: PaymentTypeQuery = {}
  ): Promise<PaymentTypesResponse> {
    try {
      const params = new URLSearchParams();

      if (query.active_only !== undefined) {
        params.append("active_only", String(query.active_only));
      }
      if (query.mode) {
        params.append("mode", query.mode);
      }

      const url = `/payment-types?${params.toString()}`;
      const response = await apiRequest(url, {
        method: "GET",
      });

      // El backend puede retornar array directamente o objeto con array
      const paymentTypes = Array.isArray(response)
        ? response
        : response.payment_types || response.paymentTypes || [];

      return {
        payment_types: paymentTypes.map(this.mapPaymentTypeResponse),
        total: response.total || paymentTypes.length,
      };
    } catch (error) {
      console.error("Error getting payment types:", error);
      throw error;
    }
  }

  // Obtener tipos de pago activos
  async getActivePaymentTypes(mode?: PaymentMode): Promise<PaymentType[]> {
    try {
      const query: PaymentTypeQuery = { active_only: true };
      if (mode) query.mode = mode;

      const response = await this.getPaymentTypes(query);
      return response.payment_types;
    } catch (error) {
      console.error("Error getting active payment types:", error);
      throw error;
    }
  }

  // Obtener tipo de pago por ID
  async getPaymentTypeById(paymentTypeId: string): Promise<PaymentType> {
    try {
      const response = await apiRequest(`/payment-types/${paymentTypeId}`, {
        method: "GET",
      });
      return this.mapPaymentTypeResponse(response);
    } catch (error) {
      console.error("Error getting payment type by ID:", error);
      throw error;
    }
  }

  // Validar si un modo de pago está permitido para un tipo específico
  async validatePaymentMode(
    paymentTypeId: string,
    mode: PaymentMode
  ): Promise<boolean> {
    try {
      const paymentType = await this.getPaymentTypeById(paymentTypeId);
      return paymentType.allowedModes.includes(mode);
    } catch (error) {
      console.error("Error validating payment mode:", error);
      return false;
    }
  }

  // Obtener tipos de pago que soportan un modo específico
  async getPaymentTypesByMode(mode: PaymentMode): Promise<PaymentType[]> {
    try {
      const response = await this.getActivePaymentTypes(mode);
      return response.filter((pt) => pt.allowedModes.includes(mode));
    } catch (error) {
      console.error("Error getting payment types by mode:", error);
      throw error;
    }
  }

  // Helper para mapear respuesta del backend
  private mapPaymentTypeResponse(response: any): PaymentType {
    return {
      id: response.id,
      name: response.name,
      code: response.code,
      description: response.description,
      isActive: response.is_active || response.isActive || false,
      allowedModes: response.allowed_modes || response.allowedModes || ["FULL"],
      minimumAmount:
        response.minimum_amount || response.minimumAmount
          ? parseFloat(response.minimum_amount || response.minimumAmount)
          : undefined,
      maximumAmount:
        response.maximum_amount || response.maximumAmount
          ? parseFloat(response.maximum_amount || response.maximumAmount)
          : undefined,
      processingFee:
        response.processing_fee || response.processingFee
          ? parseFloat(response.processing_fee || response.processingFee)
          : undefined,
      created_at: new Date(response.created_at || response.createdAt),
      updated_at: new Date(response.updated_at || response.updatedAt),
    };
  }

  // Validar monto contra límites del tipo de pago
  validateAmount(paymentType: PaymentType, amount: number): string[] {
    const errors: string[] = [];

    if (paymentType.minimumAmount && amount < paymentType.minimumAmount) {
      errors.push(`El monto mínimo es $${paymentType.minimumAmount}`);
    }

    if (paymentType.maximumAmount && amount > paymentType.maximumAmount) {
      errors.push(`El monto máximo es $${paymentType.maximumAmount}`);
    }

    return errors;
  }

  // Calcular tarifa de procesamiento
  calculateProcessingFee(paymentType: PaymentType, amount: number): number {
    if (!paymentType.processingFee) return 0;

    // Asumiendo que la tarifa es un porcentaje
    if (paymentType.processingFee < 1) {
      return amount * paymentType.processingFee;
    }

    // Si es mayor a 1, asumimos que es una tarifa fija
    return paymentType.processingFee;
  }

  // Obtener tipos de pago recomendados (solo FULL por ahora según el flujo)
  async getRecommendedPaymentTypes(): Promise<PaymentType[]> {
    try {
      const fullModeTypes = await this.getPaymentTypesByMode("FULL");
      return fullModeTypes.filter((pt) => pt.isActive);
    } catch (error) {
      console.error("Error getting recommended payment types:", error);
      return [];
    }
  }
}

export const paymentTypesService = new PaymentTypesService();
