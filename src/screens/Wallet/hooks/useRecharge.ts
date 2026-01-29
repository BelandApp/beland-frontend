import { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";
import { notify } from "src/hooks/notification/notify.external";

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
        "No se pudo cargar el widget de Payphone. Por favor, intenta nuevamente.",
      );
      setIsLoading(false);
    }
  };

  // Bank Transfer State
  const [referenceId, setReferenceId] = useState("");
  const [proofImage, setProofImage] = useState<any>(null);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] =
    useState<string>("a3b7c1d2-9f12-4b0a-85d4-123456789abc");

  // Load Payment Accounts
  useEffect(() => {
    // Import dynamically to avoid circular dependencies if any, or just at top
    // assuming PaymentAccountService is available
    const loadPaymentAccounts = async () => {
      try {
        const {
          PaymentAccountService,
        } = require("src/services/PaymentAccountApiService");
        const response = await PaymentAccountService.getPaymentAccounts();

        // Handle response structure (it returns [data, count] based on controller analysis)
        let accounts: any[] = [];
        if (Array.isArray(response)) {
          accounts = response[0] || [];
        } else if (response && (response as any).data) {
          // Standard PaginatedResponse
          accounts = (response as any).data || [];
        }
        console.log("Loaded payment accounts:", accounts);
        setPaymentAccounts(accounts);

        // Try to find the one matching "Banco Guayaquil"
        const guayaquilAccount = accounts.find(
          (acc: any) =>
            acc.bank_name?.toLowerCase().includes("guayaquil") ||
            acc.alias?.toLowerCase().includes("guayaquil"),
        );

        if (guayaquilAccount) {
          setSelectedPaymentAccountId(guayaquilAccount.id);
        } else if (accounts.length > 0) {
          setSelectedPaymentAccountId(accounts[0].id);
        }
      } catch (error) {
        console.error("Error loading payment accounts:", error);
      }
    };

    if (selectedPaymentMethod === "BANK_TRANSFER") {
      loadPaymentAccounts();
    }
  }, [selectedPaymentMethod]);

  const handleBankTransferPayment = async () => {
    if (!referenceId) {
      notify.error({ message: "Por favor ingresa el número de referencia." });
      return;
    }

    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      notify.error({ message: "Por favor ingresa un monto válido." });
      return;
    }

    // Validate Payment Account
    if (!selectedPaymentAccountId && paymentAccounts.length === 0) {
      notify.error({ message: "No hay cuentas bancarias disponibles." });
      return;
    }

    // Use selected or first one
    const accountId =
      selectedPaymentAccountId ||
      paymentAccounts[0]?.id ||
      "a3b7c1d2-9f12-4b0a-85d4-123456789abc";

    try {
      setIsLoading(true);

      const { WalletService } = require("src/services/WalletApiService");

      // Note: Backend doesn't support image upload yet.
      // We send the reference ID and we assume the user has transferred.

      await WalletService.createRechargeTransfer({
        payment_account_id: accountId,
        amount_usd: Number(amount),
        transfer_id: referenceId,
        ticket_image_url: proofImage.uri,
      });

      notify.success({
        message:
          "Solicitud de recarga enviada correctamente. Será procesada en 24-48 horas.",
      });

      // Reset logic
      setReferenceId("");
      setProofImage(null);
      setAmount("");
      setShowBankTransferModal(false);
      setSelectedPaymentMethod("");
    } catch (error: any) {
      console.error("Error creating bank transfer recharge:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo crear la solicitud de recarga.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!isValid) return;

    if (selectedPaymentMethod === "PAYPHONE") {
      await handlePayphonePayment();
    } else if (selectedPaymentMethod === "BANK_TRANSFER") {
      setShowBankTransferModal(true);
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

    // Bank Transfer State
    referenceId,
    setReferenceId,
    proofImage,
    setProofImage,
    showBankTransferModal,
    setShowBankTransferModal,
    paymentAccounts,

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
    handleBankTransferPayment, // Export handler to be used by modal
    setIsLoading,
  };
}
