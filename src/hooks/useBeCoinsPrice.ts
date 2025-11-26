import { useState, useEffect } from "react";
import { BECOIN_CONFIG } from "@/constants/currency";

/**
 * Hook para obtener y gestionar el precio de BeCoins
 * Usa la configuración definida en constants/currency.ts
 * 1 BeCoin = $0.05 USD (5 centavos)
 */
export const useBeCoinsPrice = () => {
  const [pricePerBeCoin, setPricePerBeCoin] = useState(BECOIN_CONFIG.VALUE_USD);
  const [loading, setLoading] = useState(false);

  // Funciones de conversión
  const usdToBeCoins = (usd: number): number => {
    return usd / pricePerBeCoin;
  };

  const beCoinsToUsd = (becoins: number): number => {
    return becoins * pricePerBeCoin;
  };

  // En el futuro, aquí podríamos hacer una llamada al backend
  // para obtener el precio actual de BeCoins
  useEffect(() => {
    // TODO: Implementar llamada al backend si el precio es dinámico
    // const fetchPrice = async () => {
    //   setLoading(true);
    //   try {
    //     const config = await ConfigService.getBeCoinsPrice();
    //     setPricePerBeCoin(config.price);
    //   } catch (error) {
    //     console.error("Error fetching BeCoins price:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchPrice();
  }, []);

  return {
    pricePerBeCoin,
    loading,
    usdToBeCoins,
    beCoinsToUsd,
  };
};
