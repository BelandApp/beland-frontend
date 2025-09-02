import { useState, useEffect } from "react";
import { walletService } from "../services/walletService";
import { useAuthTokenStore } from "../stores/useAuthTokenStore";
import { useBeCoinsStore } from "../stores/useBeCoinsStore";

export const useUserBalance = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthTokenStore();
  const { setBalance: setStoreBalance } = useBeCoinsStore();

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        throw new Error("Usuario no autenticado");
      }

      const wallet = await walletService.getWalletByUserId(user.email);
      const newBalance = wallet?.becoin_balance || 0;

      setBalance(newBalance);
      // Sincronizar con el store local para que BeCoinsBalance se actualice inmediatamente
      setStoreBalance(newBalance);
    } catch (err: any) {
      console.error("Error fetching balance:", err);
      setError("Error al obtener el saldo");
      setBalance(0);
      setStoreBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchBalance();
    }
  }, [user?.email]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
};
