import { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";
import { useUploadImage } from "src/hooks";
import { useThemedTabs } from "src/components";
import { notify } from "src/hooks/notification/notify.external";
import { BackendPaymentAccount, getBackendErrorMessage } from "src/services";
import { CloudinaryService } from "src/services/cloudinary/cloudinary.service";
import { useAuth } from "src/context";
import { usePayment } from "src/hooks/payment/usePayment";

// Tipos
export interface PaymentMethod {
  id: "PAYPHONE" | "BANK_TRANSFER" | "STRIPE";
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

export interface PaymentAccount {
  accountHolder: string;
  alias?: string | null;
  bank: string;
  cbu?: string | null;
  created_at: string;
  email: string;
  id: string;
  is_active: boolean;
  name: string;
  nro_account: string;
  ruc: string;
  type_account: string;
  updated_at: string;
  user_id: string;
}
// Constantes
export const PRESET_AMOUNTS = [5, 10, 25, 100];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "PAYPHONE",
    name: "PAYPHONE",
    icon: "card",
    badge: "Instantáneo",
    badgeColor: "green",
    description: "Visa / Mastercard",
  },
  {
    id: "STRIPE",
    name: "STRIPE",
    icon: "card",
    badge: "Instantáneo",
    badgeColor: "green",
    description: "Visa / Mastercard",
  },
  {
    id: "BANK_TRANSFER",
    name: "Transferencia Bancaria",
    icon: "business",
    badge: "48 horas hábiles",
    badgeColor: "gray",
    description: "Sin comisiones",
  },
];
export type PaymentMethodId = PaymentMethod["id"];

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
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalPayphone, setModalPayphone] = useState(false);
  // Cálculos derivados
  const beCoinsAmount = amount ? Math.floor(Number(amount) / 0.05) : 0;
  const usdAmount = Number(amount) || 0;
  const processingFee = 0;
  const totalAmount = usdAmount + processingFee;
  const { pay } = usePayment();

  // Validación
  const isValid = amount && selectedPaymentMethod && Number(amount) > 0;

  // Handlers
  const handleAmountChange = (value: string) => {
    // Permite números con hasta 2 decimales
    const regex = /^\d*(\.\d{0,2})?$/;

    if (regex.test(value)) {
      setAmount(value);
    }
  };

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  const handlePaymentMethodSelect = (methodId: PaymentMethodId) => {
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

    setModalPayphone(true);

    try {
      clearPayphoneStorage();

      destroyPayphoneWidget();

      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      await loadPayphoneScript();

      const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;

      if (!payphoneToken) {
        throw new Error("Token de Payphone no configurado");
      }

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
      Alert.alert("Error", "No se pudo cargar el widget de Payphone.");
      setIsLoading(false);
      setModalPayphone(false);
    }
  };

  const destroyPayphoneWidget = () => {
    if (Platform.OS !== "web") return;

    try {
      const container = document.getElementById("pp-button");

      if (container) {
        container.innerHTML = "";
      }
    } catch (error) {
      console.error("Error limpiando Payphone:", error);
    }
  };

  // Bank Transfer State
  const [referenceId, setReferenceId] = useState("");
  const {
    image,
    pickImage,
    appendToFormData,
    clearImage,
    previewUri,
    imageName,
  } = useUploadImage();
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedPaymentAccount, setSelectedPaymentAccount] =
    useState<PaymentAccount>();
  const { tabs, onTabChange, activeTab } = useThemedTabs(
    paymentAccounts.map((tab) => tab.bank),
  );

  // Change account with tab
  useEffect(() => {
    if (!activeTab || paymentAccounts.length === 0) return;

    const selected = paymentAccounts.find((acc) => acc.bank === activeTab);

    setSelectedPaymentAccount(selected);
  }, [activeTab, paymentAccounts]);

  // Load Payment Accounts
  useEffect(() => {
    // Import dynamically to avoid circular dependencies if any, or just at top
    // assuming PaymentAccountService is available
    const loadPaymentAccounts = async () => {
      try {
        const { PaymentAccountService } = require("src/services");
        const response = await PaymentAccountService.getPaymentAccounts();
        console.log("Respuesta de cuentas", response);

        // Handle response structure (it returns [data, count] based on controller analysis)
        let accounts: BackendPaymentAccount[] = [];
        if (Array.isArray(response)) {
          accounts = response[0] || [];
        } else if (response && (response as any).data) {
          // Standard PaginatedResponse
          accounts = (response as any).data || [];
        }
        console.log("Loaded payment accounts:", accounts);
        // filter only actives
        accounts = accounts.filter((account) => account.is_active);
        console.log("Cuentas activas", accounts);
        setPaymentAccounts(accounts);
        setSelectedPaymentAccount(accounts[0]);
      } catch (error) {
        const message = getBackendErrorMessage(error);
        notify.error({ message });
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
    if (!selectedPaymentAccount?.id && paymentAccounts.length === 0) {
      notify.error({ message: "No hay cuentas bancarias disponibles." });
      return;
    }

    // Use selected or first one
    const accountId =
      selectedPaymentAccount?.id ||
      paymentAccounts[0]?.id ||
      "a3b7c1d2-9f12-4b0a-85d4-123456789abc";

    try {
      setIsLoading(true);

      const { WalletService } = require("src/services/WalletApiService");
      // ===============================
      // 🖼️ CREAMOS CLOUDINARY URL
      // ===============================

      const formData = new FormData();
      appendToFormData(formData);

      const imageUrl = await CloudinaryService.uploadImage(formData);
      if (!imageUrl) {
        notify.info({
          message: "No pudimos procesar correctamente la imagen",
        });
      }

      await WalletService.createRechargeTransfer({
        payment_account_id: accountId,
        amount_usd: Number(amount),
        transfer_id: referenceId,
        ticket_image_url: imageUrl,
      });

      notify.success({
        message:
          "Solicitud de recarga enviada correctamente. Será procesada en 24-48 horas.",
      });

      // Reset logic
      setReferenceId("");
      clearImage();
      setAmount("");
      setShowBankTransferModal(false);
      setSelectedPaymentMethod(null);
    } catch (error: any) {
      console.error("Error creating bank transfer recharge:", error);
      const res = getBackendErrorMessage(error);
      notify.error({
        message:
          res || "Error creando la transferencia Bancaria, corrobora los datos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!isValid) return;
    if (!user) return;
    if (selectedPaymentMethod === "PAYPHONE") {
      await handlePayphonePayment();
    } else if (selectedPaymentMethod === "BANK_TRANSFER") {
      setShowBankTransferModal(true);
    } else if (selectedPaymentMethod === "STRIPE") {
      const result = await pay(Number(amount), user.id);
      if (result.success) {
        notify.info({ message: "Procesando el pago, te avisaremos" });
      } else {
        notify.error({ message: "No se pudo procesal el pago" });
      }
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
    previewUri,
    imageName,
    tabs,
    modalPayphone,
    setModalPayphone,
    // Bank Transfer State
    referenceId,
    setReferenceId,
    image,
    pickImage,
    showBankTransferModal,
    setShowBankTransferModal,
    paymentAccounts,
    selectedPaymentAccount,

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
    onTabChange,
    destroyPayphoneWidget,
  };
}
