import { useState, useEffect, useCallback } from "react";
import { PaymentService } from "@services/core";
import type { PaymentType, PaymentMode } from "../services/PaymentApiService";

// Hook para manejar tipos de pago
export const usePaymentTypes = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tipos de pago
  const loadPaymentTypes = useCallback(
    async (
      params: {
        active_only?: boolean;
        mode?: PaymentMode;
      } = {}
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await PaymentService.getPaymentTypes(params);
        setPaymentTypes(response);
      } catch (err: any) {
        console.error("Error loading payment types:", err);
        setError(err.message || "Error al cargar tipos de pago");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cargar solo tipos de pago activos
  const loadActivePaymentTypes = useCallback(async (mode?: PaymentMode) => {
    try {
      setLoading(true);
      setError(null);

      const activeTypes = await PaymentService.getPaymentTypes({
        active_only: true,
        mode,
      });
      setPaymentTypes(activeTypes);
    } catch (err: any) {
      console.error("Error loading active payment types:", err);
      setError(err.message || "Error al cargar tipos de pago activos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener tipo de pago por ID
  const getPaymentTypeById = useCallback(
    async (paymentTypeId: string) => {
      try {
        setLoading(true);
        setError(null);

        const paymentType = paymentTypes.find((pt) => pt.id === paymentTypeId);
        if (!paymentType) {
          // Si no está en cache, cargar todos y buscar
          await loadPaymentTypes();
          return paymentTypes.find((pt) => pt.id === paymentTypeId) || null;
        }
        return paymentType;
      } catch (err: any) {
        console.error("Error getting payment type by ID:", err);
        setError(err.message || "Error al obtener tipo de pago");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [paymentTypes, loadPaymentTypes]
  );

  // Validar modo de pago
  const validatePaymentMode = useCallback(
    async (paymentTypeId: string, mode: PaymentMode) => {
      try {
        const paymentType = paymentTypes.find((pt) => pt.id === paymentTypeId);
        return paymentType ? paymentType.allowed_modes.includes(mode) : false;
      } catch (err: any) {
        console.error("Error validating payment mode:", err);
        return false;
      }
    },
    [paymentTypes]
  );

  // Obtener tipos de pago por modo
  const getPaymentTypesByMode = useCallback(async (mode: PaymentMode) => {
    try {
      setLoading(true);
      setError(null);

      const types = await PaymentService.getPaymentTypes({ mode });
      return types;
    } catch (err: any) {
      console.error("Error getting payment types by mode:", err);
      setError(err.message || "Error al obtener tipos de pago por modo");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar monto contra límites
  const validateAmount = useCallback(
    (paymentType: PaymentType, amount: number) => {
      const errors: string[] = [];

      if (paymentType.minimum_amount && amount < paymentType.minimum_amount) {
        errors.push(`Monto mínimo: $${paymentType.minimum_amount}`);
      }

      if (paymentType.maximum_amount && amount > paymentType.maximum_amount) {
        errors.push(`Monto máximo: $${paymentType.maximum_amount}`);
      }

      return errors;
    },
    []
  );

  // Calcular tarifa de procesamiento
  const calculateProcessingFee = useCallback(
    (paymentType: PaymentType, amount: number) => {
      return paymentType.processing_fee
        ? (amount * paymentType.processing_fee) / 100
        : 0;
    },
    []
  );

  // Obtener tipos de pago recomendados (solo activos)
  const getRecommendedPaymentTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const recommended = await PaymentService.getPaymentTypes({
        active_only: true,
      });
      return recommended.filter((pt) => pt.allowed_modes.includes("FULL"));
    } catch (err: any) {
      console.error("Error getting recommended payment types:", err);
      setError(err.message || "Error al obtener tipos de pago recomendados");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar tipos de pago por modo
  const filterByMode = useCallback(
    (mode: PaymentMode) => {
      return paymentTypes.filter((pt) => pt.allowed_modes.includes(mode));
    },
    [paymentTypes]
  );

  // Filtrar solo tipos activos
  const getActiveTypes = useCallback(() => {
    return paymentTypes.filter((pt) => pt.is_active);
  }, [paymentTypes]);

  // Obtener tipo de pago predeterminado (primer FULL activo)
  const getDefaultPaymentType = useCallback(() => {
    const fullTypes = filterByMode("FULL");
    const activeFullTypes = fullTypes.filter((pt) => pt.is_active);
    return activeFullTypes.length > 0 ? activeFullTypes[0] : null;
  }, [filterByMode]);

  // Verificar si un tipo de pago soporta un monto específico
  const supportsAmount = useCallback(
    (paymentType: PaymentType, amount: number) => {
      const errors = validateAmount(paymentType, amount);
      return errors.length === 0;
    },
    [validateAmount]
  );

  // Cargar tipos de pago activos al montar el componente
  useEffect(() => {
    loadActivePaymentTypes();
  }, [loadActivePaymentTypes]);

  return {
    paymentTypes,
    loading,
    error,
    loadPaymentTypes,
    loadActivePaymentTypes,
    getPaymentTypeById,
    validatePaymentMode,
    getPaymentTypesByMode,
    validateAmount,
    calculateProcessingFee,
    getRecommendedPaymentTypes,
    filterByMode,
    getActiveTypes,
    getDefaultPaymentType,
    supportsAmount,
  };
};
