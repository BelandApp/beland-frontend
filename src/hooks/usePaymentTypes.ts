import { useState, useEffect, useCallback } from "react";
import {
  paymentTypesService,
  PaymentType,
  PaymentMode,
  PaymentTypeQuery,
} from "../services/paymentTypesService";

// Hook para manejar tipos de pago
export const usePaymentTypes = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tipos de pago
  const loadPaymentTypes = useCallback(async (query: PaymentTypeQuery = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentTypesService.getPaymentTypes(query);
      setPaymentTypes(response.payment_types);
    } catch (err: any) {
      console.error("Error loading payment types:", err);
      setError(err.message || "Error al cargar tipos de pago");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar solo tipos de pago activos
  const loadActivePaymentTypes = useCallback(async (mode?: PaymentMode) => {
    try {
      setLoading(true);
      setError(null);

      const activeTypes = await paymentTypesService.getActivePaymentTypes(mode);
      setPaymentTypes(activeTypes);
    } catch (err: any) {
      console.error("Error loading active payment types:", err);
      setError(err.message || "Error al cargar tipos de pago activos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener tipo de pago por ID
  const getPaymentTypeById = useCallback(async (paymentTypeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const paymentType = await paymentTypesService.getPaymentTypeById(
        paymentTypeId
      );
      return paymentType;
    } catch (err: any) {
      console.error("Error getting payment type by ID:", err);
      setError(err.message || "Error al obtener tipo de pago");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar modo de pago
  const validatePaymentMode = useCallback(
    async (paymentTypeId: string, mode: PaymentMode) => {
      try {
        const isValid = await paymentTypesService.validatePaymentMode(
          paymentTypeId,
          mode
        );
        return isValid;
      } catch (err: any) {
        console.error("Error validating payment mode:", err);
        return false;
      }
    },
    []
  );

  // Obtener tipos de pago por modo
  const getPaymentTypesByMode = useCallback(async (mode: PaymentMode) => {
    try {
      setLoading(true);
      setError(null);

      const types = await paymentTypesService.getPaymentTypesByMode(mode);
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
      return paymentTypesService.validateAmount(paymentType, amount);
    },
    []
  );

  // Calcular tarifa de procesamiento
  const calculateProcessingFee = useCallback(
    (paymentType: PaymentType, amount: number) => {
      return paymentTypesService.calculateProcessingFee(paymentType, amount);
    },
    []
  );

  // Obtener tipos de pago recomendados (solo FULL)
  const getRecommendedPaymentTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const recommended =
        await paymentTypesService.getRecommendedPaymentTypes();
      return recommended;
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
      return paymentTypes.filter((pt) => pt.allowedModes.includes(mode));
    },
    [paymentTypes]
  );

  // Filtrar solo tipos activos
  const getActiveTypes = useCallback(() => {
    return paymentTypes.filter((pt) => pt.isActive);
  }, [paymentTypes]);

  // Obtener tipo de pago predeterminado (primer FULL activo)
  const getDefaultPaymentType = useCallback(() => {
    const fullTypes = filterByMode("FULL");
    const activeFullTypes = fullTypes.filter((pt) => pt.isActive);
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
