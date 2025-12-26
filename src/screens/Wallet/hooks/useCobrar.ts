import { useEffect, useState, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { WalletService, PaymentService } from "@services/core";
import { usePaymentSocket } from "src/hooks/usePaymentSocket";

// Tipos
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface CobrarState {
  amount: string;
  concept: string;
  selectedCurrency: string;
  isGeneratingQR: boolean;
  qrCode: string | null;
}

// Constantes
export const SUGGESTED_AMOUNTS = [1, 2, 5, 10, 20];

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "Dólar", symbol: "$", flag: "🇺🇸" },
  //   { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  //   { code: "COP", name: "Peso Colombiano", symbol: "$", flag: "🇨🇴" },
];

// Utilidades
export const formatAmount = (value: string): string => {
  // Remover caracteres no numéricos excepto el punto decimal
  const cleanValue = value.replace(/[^0-9.]/g, "");

  // Asegurar solo un punto decimal
  const parts = cleanValue.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }

  // Limitar decimales a 2
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + "." + parts[1].substring(0, 2);
  }

  return cleanValue;
};

export const convertToBeCoins = (
  amount: number,
  currencyCode: string
): number => {
  // Tasa de conversión: 1 BeCoin = $0.05 USD
  const BECOIN_USD_RATE = 0.05;

  // Tasas de conversión aproximadas (deberían venir de un API en producción)
  const exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 1.1,
    COP: 0.00025,
  };

  const amountInUSD = amount * (exchangeRates[currencyCode] || 1);
  return Math.floor(amountInUSD / BECOIN_USD_RATE);
};

// Hook personalizado
export function useCobrar() {
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const qrCacheRef = useRef<string | null>(null);

  // Presets & amounts persisted in backend
  const [presets, setPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);

  const [amounts, setAmounts] = useState<any[]>([]);
  const [loadingAmounts, setLoadingAmounts] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Datos calculados
  const numericAmount = parseFloat(amount) || 0;
  const beCoinsAmount = convertToBeCoins(numericAmount, selectedCurrency);
  const isValid = amount && numericAmount > 0;
  const selectedCurrencyData =
    CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  // Handlers
  const handleAmountChange = (value: string) => {
    const formatted = formatAmount(value);
    setAmount(formatted);
  };

  const handleSuggestedAmount = (suggestedAmount: number) => {
    setAmount(suggestedAmount.toFixed(2));
  };

  /** -----------------------------
   *  Presets & Amounts API
   ------------------------------*/
  const fetchPresets = useCallback(async () => {
    setLoadingPresets(true);
    try {
      const res = await WalletService.getPresetAmounts();
      const arr = Array.isArray(res[0]) ? res[0] : res;
      setPresets(arr || []);
    } catch (err) {
      console.error("Error fetching presets:", err);
      setPresets([]);
    } finally {
      setLoadingPresets(false);
    }
  }, []);

  const createPreset = useCallback(
    async (payload: { name: string; amount: number; message?: string }) => {
      try {
        const resp = await WalletService.createPresetAmount(payload);
        await fetchPresets();
        Alert.alert("OK", "Preset creado");
        return resp;
      } catch (err) {
        console.error("Error creating preset:", err);
        Alert.alert("Error", "No se pudo crear el preset");
      }
    },
    [fetchPresets]
  );

  const deletePreset = useCallback(
    async (id: string) => {
      try {
        await WalletService.deletePresetAmount(id);
        await fetchPresets();
      } catch (err) {
        console.error("Error deleting preset:", err);
        Alert.alert("Error", "No se pudo eliminar el preset");
      }
    },
    [fetchPresets]
  );

  const fetchAmounts = useCallback(async () => {
    setLoadingAmounts(true);
    try {
      const res = await WalletService.getAmountsToPayment();
      const arr = Array.isArray(res[0]) ? res[0] : res;
      setAmounts(arr || []);
    } catch (err) {
      console.error("Error fetching amounts:", err);
      setAmounts([]);
    } finally {
      setLoadingAmounts(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const w = await PaymentService.getWallet();
      const walletId = w?.id;
      if (!walletId) {
        setTransactions([]);
        return;
      }
      const resp = await WalletService.getTransactions(1, 20, walletId);
      const arr = Array.isArray(resp[0]) ? resp[0] : resp;
      setTransactions(arr || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  const createAmount = useCallback(
    async (value: number, message?: string) => {
      try {
        const resp = await WalletService.createAmountToPayment({
          amount: value,
          message,
        });
        // refresh list
        await fetchAmounts();
        return resp;
      } catch (err) {
        console.error("Error creating amount:", err);
        Alert.alert("Error", "No se pudo crear el monto");
        throw err;
      }
    },
    [fetchAmounts]
  );

  const deleteAmount = useCallback(
    async (id: string) => {
      try {
        await WalletService.deleteAmountToPayment(id);
        await fetchAmounts();
      } catch (err) {
        console.error("Error deleting amount:", err);
        Alert.alert("Error", "No se pudo eliminar el monto");
      }
    },
    [fetchAmounts]
  );

  // React to realtime socket events (new payments / deletions)
  usePaymentSocket((data: any) => {
    try {
      // If backend notifies an amount deletion, remove it from list
      if (data && data.amount_payment_id_deleted) {
        setAmounts((prev) =>
          prev.filter((a) => a.id !== data.amount_payment_id_deleted)
        );
      }

      // If a payment was received, push it to transactions and clear QR
      const paymentPresent = Boolean(
        data &&
          (data.amount_payment_id ||
            data.amount_to_payment_id ||
            data.payment_id ||
            data.amount)
      );
      if (paymentPresent) {
        setTransactions((prev) => [data, ...prev].slice(0, 50));
        // hide QR if shown
        setQrCode(null);
        // refresh available amounts and transactions
        fetchAmounts();
        fetchTransactions();
      }

      // If backend sends created amount id, refresh list
      if (data && data.amount_payment_id_created) {
        fetchAmounts();
      }
    } catch (e) {
      // ignore
    }
  });

  const handleConceptChange = (value: string) => {
    // Limitar a 100 caracteres
    if (value.length <= 100) {
      setConcept(value);
    }
  };

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
  };

  const generatePaymentData = () => {
    return {
      amount: numericAmount,
      currency: selectedCurrency,
      concept: concept || "Pago de servicios",
      beCoinsAmount,
      timestamp: Date.now(),
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  };

  const handleGenerateQR = async () => {
    if (!isValid) {
      Alert.alert("Error", "Por favor ingresa un monto válido");
      return;
    }

    try {
      setIsGeneratingQR(true);
      // 1) crear amount en backend (incluyendo concepto como mensaje opcional)
      await createAmount(numericAmount, concept || undefined);

      // 2) obtener QR del wallet (es estático). Usar caché local para evitar llamadas innecesarias
      if (qrCacheRef.current) {
        setQrCode(qrCacheRef.current);
      } else {
        const qrResp = await WalletService.getWalletQR();
        if (qrResp && qrResp.qr) {
          qrCacheRef.current = qrResp.qr;
          setQrCode(qrResp.qr);
        }
      }

      Alert.alert(
        "✅ Código QR Generado",
        `Se ha generado el código QR para cobrar ${
          selectedCurrencyData.symbol
        }${numericAmount.toFixed(
          2
        )} ${selectedCurrency}\n\n${beCoinsAmount.toLocaleString()} BeCoins`,
        [
          { text: "Compartir", onPress: handleShareQR },
          { text: "Ver QR", style: "cancel" },
        ]
      );
    } catch (error) {
      console.error("Error generando QR:", error);
      Alert.alert(
        "Error",
        "No se pudo generar el código QR. Por favor, intenta nuevamente."
      );
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleShareQR = () => {
    // Implementar lógica de compartir
    Alert.alert("Compartir", "Función de compartir en desarrollo");
  };

  const handleResetQR = () => {
    setQrCode(null);
    setAmount("");
    setConcept("");
  };

  const handleEditPresets = () => {
    // Placeholder: UI-level should open modal or navigate to presets manager.
    Alert.alert(
      "Editar Presets",
      "Abre el administrador de presets (implementar UI)."
    );
  };

  // Initial load
  useEffect(() => {
    fetchPresets();
    fetchAmounts();
    fetchTransactions();
  }, [fetchPresets, fetchAmounts]);

  return {
    // Estado
    amount,
    concept,
    selectedCurrency,
    isGeneratingQR,
    qrCode,
    // Presets & amounts
    presets,
    loadingPresets,
    amounts,
    loadingAmounts,

    // Datos calculados
    numericAmount,
    beCoinsAmount,
    isValid,
    selectedCurrencyData,

    // Handlers
    handleAmountChange,
    handleSuggestedAmount,
    handleConceptChange,
    handleCurrencySelect,
    handleGenerateQR,
    handleShareQR,
    handleResetQR,
    handleEditPresets,
    // Preset / amount actions
    fetchPresets,
    createPreset,
    deletePreset,
    fetchAmounts,
    createAmount,
    deleteAmount,
    // transactions
    transactions,
    loadingTransactions,
    fetchTransactions,
  };
}
