import { useState, useEffect, useMemo } from "react";
import { GroupService, PaymentType } from "src/services/groups/GroupApiService";

/**
 * Hook para cargar y cachear tipos de pago de grupos
 * Los payment types no cambian durante la sesión, por lo que se cachean con useMemo
 */
export const useGroupPaymentTypes = () => {
  const [paymentTypesArray, setPaymentTypesArray] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar payment types una sola vez
  useEffect(() => {
    const loadPaymentTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await GroupService.getPaymentTypes();
        setPaymentTypesArray(data);
      } catch (err: any) {
        console.error("Error cargando tipos de pago:", err);
        setError(err.message || "Error al cargar tipos de pago");
        setPaymentTypesArray([]);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentTypes();
  }, []);

  // Crear mapa de payment types cachedo con useMemo
  const paymentTypesMap = useMemo(() => {
    return paymentTypesArray.reduce(
      (acc, pt) => {
        acc[pt.id] = pt;
        return acc;
      },
      {} as Record<string, PaymentType>,
    );
  }, [paymentTypesArray]);

  return {
    paymentTypesMap,
    paymentTypesArray,
    loading,
    error,
  };
};
