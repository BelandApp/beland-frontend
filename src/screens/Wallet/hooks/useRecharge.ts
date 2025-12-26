import { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";

// Tipos
export interface PaymentMethod {
  id: "PAYPHONE" | "BANK_TRANSFER";
  name: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

export interface RechargeState {
  amount: string;
  selectedPaymentMethod: string;
  isLoading: boolean;
}

// Constantes
export const PRESET_AMOUNTS = [1, 2, 5, 10, 20];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "PAYPHONE",
    name: "Tarjeta Crédito/Débito",
    icon: "card",
    badge: "Instantáneo",
    badgeColor: "green",
    description: "Visa / Mastercard ",
  },
  {
    id: "BANK_TRANSFER",
    name: "Transferencia Bancaria",
    icon: "business",
    badge: "1-2 días",
    badgeColor: "gray",
    description: "Sin comisiones",
  },
];

// Función para cargar el script Payphone en web
function loadPayphoneScript(): Promise<void> {
  if (Platform.OS !== "web") {
    return Promise.reject(new Error("Payphone solo está disponible en web"));
  }

  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (typeof window === "undefined") {
      reject(new Error("Window no está definido"));
      return;
    }

    // Cargar CSS solo una vez
    // @ts-ignore
    if (!document.getElementById("payphone-css")) {
      // @ts-ignore
      const link = document.createElement("link");
      link.id = "payphone-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
      // @ts-ignore
      document.head.appendChild(link);
    }

    // Cargar JS solo una vez
    // @ts-ignore
    if (window.PPaymentButtonBox) {
      resolve();
      return;
    }

    // @ts-ignore
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar el script de Payphone."));
    // @ts-ignore
    document.body.appendChild(script);
  });
}

// Hook personalizado
export function useRecharge() {
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cálculos derivados
  const beCoinsAmount = amount ? Math.floor(Number(amount) / 0.05) : 0;
  const usdAmount = Number(amount) || 0;
  const processingFee = 0;
  const totalAmount = usdAmount + processingFee;

  // Validación
  const isValid = amount && selectedPaymentMethod && Number(amount) > 0;

  // Handlers
  const handleAmountChange = (value: string) => {
    // Solo permitir números
    const cleanValue = value.replace(/[^0-9]/g, "");
    setAmount(cleanValue);
  };

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const clearPayphoneStorage = () => {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      localStorage.removeItem("payphone_to_wallet_id");
      localStorage.removeItem("payphone_amount_to_payment_id");
      localStorage.removeItem("payphone_is_qr_payment");

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("payphone_to_wallet_id");
        sessionStorage.removeItem("payphone_amount_to_payment_id");
      }
    }
  };

  const handlePayphonePayment = async () => {
    if (Platform.OS !== "web") {
      Alert.alert("Error", "Payphone solo está disponible en la versión web");
      return;
    }

    try {
      // Limpiar variables QR antes de iniciar recarga
      clearPayphoneStorage();

      // Limpiar el contenedor del botón
      // @ts-ignore
      const ppDiv = document.getElementById("pp-button");
      if (ppDiv) ppDiv.innerHTML = "";

      setIsLoading(true);

      // Esperar un momento antes de cargar el script
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Cargar el script de Payphone
      await loadPayphoneScript();

      const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;

      if (!payphoneToken) {
        throw new Error("Token de Payphone no configurado");
      }

      // @ts-ignore
      localStorage.setItem("payphone_token", payphoneToken);

      const payphoneConfig = {
        token: payphoneToken,
        clientTransactionId: `TX-${Date.now()}`,
        amount: parseInt(amount) * 100,
        amountWithoutTax: parseInt(amount) * 100,
        currency: "USD",
        storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
        reference: "Recarga Beland",
      };

      // @ts-ignore
      new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
    } catch (error) {
      console.error("Error al cargar Payphone:", error);
      Alert.alert(
        "Error",
        "No se pudo cargar el widget de Payphone. Por favor, intenta nuevamente."
      );
      setIsLoading(false);
    }
  };

  const handleBankTransferPayment = () => {
    Alert.alert(
      "Transferencia Bancaria",
      "Función en desarrollo para transferencia bancaria"
    );
  };

  const handleProceedToPayment = async () => {
    if (!isValid) return;

    if (selectedPaymentMethod === "PAYPHONE") {
      await handlePayphonePayment();
    } else if (selectedPaymentMethod === "BANK_TRANSFER") {
      handleBankTransferPayment();
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (Platform.OS === "web") {
        clearPayphoneStorage();
      }
    };
  }, []);

  return {
    // Estado
    amount,
    selectedPaymentMethod,
    isLoading,

    // Datos calculados
    beCoinsAmount,
    usdAmount,
    processingFee,
    totalAmount,
    isValid,

    // Handlers
    handleAmountChange,
    handlePresetAmount,
    handlePaymentMethodSelect,
    handleProceedToPayment,
    setIsLoading,
  };
}
