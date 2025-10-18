import { useState, useEffect } from "react";
import { WalletData } from "../types";
import { formatUSDPrice } from "../../../constants";
import { useBeCoinsStore } from "../../../stores/useBeCoinsStore";
import { useAuth } from "../../../hooks/AuthContext";
import { walletService, Wallet } from "../../../services/walletService";

export const useWalletData = () => {
  const { user } = useAuth();
  const { balance, setBalance, setLockedBalance } = useBeCoinsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullWalletData, setFullWalletData] = useState<Wallet | null>(null);

  const fetchWalletData = async () => {
    if (!user?.email || !user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const wallet = await walletService.getWalletByUserId(user.email, user.id);

      // Convertir el balance del backend (string) a número
      const backendBalance =
        typeof wallet.becoin_balance === "string"
          ? isNaN(parseFloat(wallet.becoin_balance))
            ? 0
            : parseFloat(wallet.becoin_balance)
          : isNaN(wallet.becoin_balance)
          ? 0
          : wallet.becoin_balance || 0;

      // Convertir el balance bloqueado del backend (string) a número
      const backendLockedBalance =
        typeof wallet.locked_balance === "string"
          ? isNaN(parseFloat(wallet.locked_balance))
            ? 0
            : parseFloat(wallet.locked_balance)
          : isNaN(wallet.locked_balance)
          ? 0
          : wallet.locked_balance || 0;

      // Actualizar el store con el balance real del backend
      setBalance(backendBalance);
      setLockedBalance(backendLockedBalance);
      // Guardar los datos completos de la wallet
      setFullWalletData(wallet);

      // Nota: Las transferencias pendientes no están disponibles en el backend actual
    } catch (err: any) {
      console.warn("API no disponible, usando datos locales:", err);
      setError(null); // No mostrar error, usar datos locales como fallback
      // En caso de error de red, mantener datos locales silenciosamente
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchWalletData();
    }
  }, [user?.email]);

  const walletData: WalletData = {
    balance: balance, // Balance del store (actualizado desde backend o demo)
    locked_balance: fullWalletData?.locked_balance ?? 0, // Balance bloqueado del backend
    estimatedValue: formatUSDPrice(balance * 0.05), // Valor estimado en USD (solo conversión directa)
    alias: fullWalletData?.alias ?? undefined,
  };

  return {
    walletData,
    fullWalletData, // Datos completos de la wallet del backend
    loading,
    error,
    refetch: fetchWalletData,
  };
};
