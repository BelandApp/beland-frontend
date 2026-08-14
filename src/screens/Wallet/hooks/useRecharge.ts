import { useState, useEffect } from "react";
import { useCustomNavigation, useUploadImage } from "src/hooks";
import { useThemedTabs } from "src/components";
import { notify } from "src/hooks/notification/notify.external";
import { BackendPaymentAccount, getBackendErrorMessage } from "src/services";
import { CloudinaryService } from "src/services/cloudinary/cloudinary.service";
import { usePayment } from "src/hooks/payment/usePayment.web";
import { useAuth } from "src/context";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { destroyPayphoneWidget, loadPayphoneScript } from "./usePayphone";
import { generateClientTransactionId } from "src/screens/PayphoneSuccessScreen/utils/helpers";

// Tipos

interface commission {
  totalUsd: number;
  base: number;
}

export interface PaymentMethod {
  id: "BANK_TRANSFER" | "STRIPE" | "PAYPHONE";
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

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "STRIPE",
    name: "STRIPE",
    icon: "card",
    badge: "Instantáneo",
    badgeColor: "green",
    description: "Pago mediante Stripe",
  },
  {
    id: "PAYPHONE",
    name: "PAYPHONE",
    icon: "card",
    badge: "Instantáneo",
    badgeColor: "green",
    description: "Pago mediante Payphone",
  },
  {
    id: "BANK_TRANSFER",
    name: "Transferencia Bancaria",
    icon: "business",
    badge: "48 horas hábiles",
    badgeColor: "gray",
    description: "Operación manual",
  },
];
type PaymentMethodId = PaymentMethod["id"];
//helper

export const cardBrandStyles: Record<string, { color: string; label: string }> =
  {
    visa: {
      color: "#1A1F71",
      label: "Visa",
    },
    mastercard: {
      color: "#213143",
      label: "Mastercard",
    },
    amex: {
      color: "#2E77BC",
      label: "American Express",
    },
    unknown: {
      color: "#9CA3AF",
      label: "Tarjeta",
    },
  };
type useRechargeType = {
  paramsAmount: string;
};
export function useRecharge({ paramsAmount }: useRechargeType) {
  const parsedAmount = Number(paramsAmount);
  const normalizedAmount =
    !paramsAmount || isNaN(parsedAmount) ? 5 : Math.max(parsedAmount, 5);
  const [amount, setAmount] = useState<string>(normalizedAmount.toFixed(2));
  const [commission, setCommission] = useState<commission>({
    totalUsd: 0,
    base: 0,
  });
  const [modal, setModal] = useState<PaymentMethodId | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Cálculos derivados
  const beCoinsAmount = amount ? Math.floor(Number(amount) / 0.05) : 0;
  const usdAmount = Number(amount) || 0;
  const { pay } = usePayment();
  const { navigate } = useCustomNavigation();
  // Validación
  const isValid = amount && selectedPaymentMethod && Number(amount) > 0;
  let PRESET_AMOUNTS = ["5.00", "10.00", "25.00", "100.00"];
  if (paramsAmount) {
    PRESET_AMOUNTS = [normalizedAmount.toFixed(2)];
  }

  // Handlers
  const handleAmountChange = (value: string) => {
    // Permite números con hasta 2 decimales
    const regex = /^\d*(\.\d{0,2})?$/;

    if (regex.test(value)) {
      setAmount(value);
    }
  };

  const handlePresetAmount = (presetAmount: string) => {
    setAmount(presetAmount);
  };

  const handlePaymentMethodSelect = (methodId: PaymentMethodId) => {
    setSelectedPaymentMethod(methodId);
    if (methodId === "PAYPHONE") {
      setCommission({ totalUsd: Number(amount) * 0.06, base: 6 });
    } else if (methodId === "STRIPE") {
      setCommission({ totalUsd: Number(amount) * 0.05, base: 5 });
    } else {
      setCommission({
        totalUsd: 0,
        base: 0,
      });
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

        // Handle response structure (it returns [data, count] based on controller analysis)
        let accounts: BackendPaymentAccount[] = [];
        if (Array.isArray(response)) {
          accounts = response[0] || [];
        } else if (response && (response as any).data) {
          // Standard PaginatedResponse
          accounts = (response as any).data || [];
        }
        // filter only actives
        accounts = accounts.filter((account) => account.is_active);
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
      setModal(null);
      setSelectedPaymentMethod(null);
    } catch (error: any) {
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
    if (selectedPaymentMethod === "BANK_TRANSFER") {
      setModal("BANK_TRANSFER");
    } else if (selectedPaymentMethod === "STRIPE") {
      const result = await pay(Number(amount), "RECHARGE");
      if (result.success) {
        setClientSecret(result.clientSecret);
        setModal("STRIPE");
      }
    } else if (selectedPaymentMethod === "PAYPHONE") {
      destroyPayphoneWidget();
      setModal("PAYPHONE");
      // await loadPayphoneScript();
      // console.log("Payphone script loaded");
      // const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;
      // console.log("payphoneToken", payphoneToken);
      // if (!payphoneToken) {
      //   throw new Error("Token de Payphone no configurado");
      // }
      // const clientTransactionId = generateClientTransactionId();
      // console.log("clientTransactionId", clientTransactionId);
      // const payphoneConfig = {
      //   token: payphoneToken,
      //   clientTransactionId: clientTransactionId,
      //   amount: parseInt(amount) * 100,
      //   amountWithoutTax: parseInt(amount) * 100,
      //   currency: "USD",
      //   storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
      //   reference: "Recarga Beland",
      // };

      // // @ts-ignore
      // new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
      // console.log("Payphone READY");
    }
  };

  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardElement);

    if (!card) return;
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
      },
    });

    if (result.error) {
      notify.error({ message: "Hubo un error, intenta luego" });
      setTimeout(() => {
        setModal(null);
      }, 3000);
    } else if (result.paymentIntent?.status === "succeeded") {
      notify.success({ message: "Pago exitoso, se acreditara en la brevedad" });
      setTimeout(() => {
        setModal(null);
        if (paramsAmount) {
          navigate("MainTabs", {
            screen: "Catalog",
            params: { comeFromRecharge: true },
          });
        } else {
          navigate("WalletHistoryScreen");
        }
      }, 3000);
    }
  };
  useEffect(() => {
    if (modal !== "PAYPHONE") return;

    let isMounted = true;

    const initPayphone = async () => {
      try {
        setIsLoading(true);
        await loadPayphoneScript();

        if (!isMounted) return;

        const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;
        if (!payphoneToken) {
          throw new Error("Token de Payphone no configurado");
        }
        localStorage.setItem("payphone_token", payphoneToken);
        localStorage.setItem("comeFromRecharge", "true");
        // Convertir float a centavos evitando problemas con decimales
        const parsedAmount = Math.round(parseFloat(amount) * 100);
        const clientTransactionId = generateClientTransactionId();

        const payphoneConfig = {
          token: payphoneToken,
          clientTransactionId: clientTransactionId,
          amount: parsedAmount,
          amountWithoutTax: parsedAmount,
          currency: "USD",
          storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
          reference: "Recarga Beland",
        };

        // Esperar 50ms/100ms para asegurar que React insertó el id="pp-button" en el DOM
        setTimeout(() => {
          if (!isMounted) return;

          destroyPayphoneWidget(); // Limpiamos renders previos

          // @ts-ignore
          if (window.PPaymentButtonBox) {
            // @ts-ignore
            new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
            console.log("Payphone cargado con éxito");
          }
        }, 100);
      } catch (error) {
        console.error("Error al inicializar Payphone:", error);
        notify.error({ message: "No se pudo cargar la pasarela de Payphone" });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initPayphone();

    // Limpieza al cerrar el modal o desmontar
    return () => {
      isMounted = false;
      destroyPayphoneWidget();
    };
  }, [modal, amount]);

  return {
    // Estado
    amount,
    selectedPaymentMethod,
    isLoading,
    previewUri,
    imageName,
    tabs,
    modal,
    setModal,
    cardBrand,
    setCardBrand,
    PRESET_AMOUNTS,

    // Bank Transfer State
    referenceId,
    setReferenceId,
    image,
    pickImage,
    paymentAccounts,
    selectedPaymentAccount,

    // Datos calculados
    beCoinsAmount,
    usdAmount,
    isValid,
    commission,

    // Handlers
    handleAmountChange,
    handlePresetAmount,
    handlePaymentMethodSelect,
    handleProceedToPayment,
    handleBankTransferPayment, // Export handler to be used by modal
    setIsLoading,
    onTabChange,
    handlePay,
  };
}
