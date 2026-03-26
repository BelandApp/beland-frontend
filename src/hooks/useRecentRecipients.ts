import { useState, useEffect } from "react";
import { TransactionService, RecentRecipient } from "@services/core";
import { useAuth } from "src/context";

/**
 * Hook para obtener los contactos recientes a los que se ha transferido
 */
export const useRecentRecipients = () => {
  const { isAuthenticated } = useAuth();
  const [recipients, setRecipients] = useState<RecentRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionService.getRecentRecipients({ limit: 10 });
      // Asegurar que siempre sea un array
      const validData = Array.isArray(data) ? data : [];
      console.log("Recent recipients loaded:", validData.length, "contacts");
      setRecipients(validData);
    } catch (err: any) {
      console.error("Error fetching recent recipients:", err);
      setError(err.message || "Error al cargar contactos recientes");
      setRecipients([]); // Asegurar array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRecipients();
  }, []);

  return {
    recipients,
    loading,
    error,
    refetch: fetchRecipients,
  };
};
