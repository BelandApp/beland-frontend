import { useState, useEffect } from "react";
import { WalletData } from "../types";
import { formatUSDPrice } from "../../../constants";
import { useBeCoinsStore } from "@/stores";
import { useAuth } from "@/context/AuthContext";
import { PaymentService, Wallet } from "@services/core";
import { getBackendErrorMessage } from "src/services";

export const useWalletData = () => {
  const { user } = useAuth();
  const { balance, syncFromBackend } = useBeCoinsStore();
  const [loading, setLoading] = useState(false);
  const [fullWalletData, setFullWalletData] = useState<Wallet | null>(null);

  const fetchWalletData = async () => {
    if (!user?.email || !user?.id) {
      return;
    }

    setLoading(true);

    try {
      const wallet = await PaymentService.getWallet();

      // Convertir el balance del backend (string) a número - usando propiedades reales del backend
      const backendBalance =
        typeof wallet.becoin_balance === "string"
          ? isNaN(parseFloat(wallet.becoin_balance))
            ? 0
            : parseFloat(wallet.becoin_balance)
          : isNaN(wallet.becoin_balance)
          ? 0
          : wallet.becoin_balance || 0;

      // Convertir el balance bloqueado del backend (string) a número - usando propiedades reales del backend
      const backendLockedBalance =
        typeof wallet.locked_balance === "string"
          ? isNaN(parseFloat(wallet.locked_balance))
            ? 0
            : parseFloat(wallet.locked_balance)
          : isNaN(wallet.locked_balance)
          ? 0
          : wallet.locked_balance || 0;
      // Actualizar el store con el balance real del backend
      syncFromBackend({ balance: backendBalance, locked_balance: backendLockedBalance });
      // Guardar los datos completos de la wallet
      setFullWalletData(wallet);
    } catch (err: any) {
      const message = getBackendErrorMessage(err);
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
    balance: balance, // Balance del store (actualizado desde backend)
    locked_balance: fullWalletData?.locked_balance ?? 0, // Balance bloqueado del backend (propiedades reales)
    estimatedValue: formatUSDPrice(balance * 0.05), // Valor estimado en USD (solo conversión directa)
    alias: fullWalletData?.alias ?? undefined, // Alias real del backend
  };

  return {
    walletData,
    fullWalletData, 
    loading,
    refetch: fetchWalletData,
  };
};
