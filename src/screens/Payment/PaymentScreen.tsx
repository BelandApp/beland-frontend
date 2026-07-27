import React, { useState, useEffect } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { TransactionContextManager } from "../../hooks/usePaymentSocket";
import { useUserResources } from "../../hooks/useUserResources";
import { WalletService } from "@services/core";
import DiscountsButton from "./components/DiscountsButton";
import DiscountsModal from "./components/DiscountsModal";

// Importar estilos y componentes
import { containerStyles, amountStyles } from "./styles";

import {
  PaymentHeader,
  PaymentMethodSelector,
  PresetAmounts,
} from "./components";
import { BankTransferModal } from "./components/BankTransferModal";

// Importar tipos reales
import { UserResource as RealUserResource } from "../../types/resource";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useNotify } from "src/hooks";
import { getBackendErrorMessage } from "src/services";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Button, ThemedHeader } from "src/components";

// Types del código original
type Resource = {
  id: string;
  resource_name: string;
  resource_desc: string;
  resource_quanity: number;
  resource_discount: number;
};

type Redemption = {
  id: string;
  code: string;
  type: "DISCOUNT" | "BONUS_COINS" | "CIRCULARES";
  value: number;
  is_redeemed: boolean;
  expires_at?: string;
  description?: string;
};

export type PaymentData = {
  amount: number;
  message?: string;
  resource?: Resource[];
  wallet_id?: string;
  commerce_name?: string;
  commerce_img?: string;
  redemptions?: Redemption[];
  user_resources?: RealUserResource[];
  amount_to_payment_id?: string | null;
  noHidden?: boolean;
};
export type PaymentScreenProps = {
  paymentData: PaymentData;
  amount_to_payment_id?: string | null;
};
export type PaymentScreenParamList = {
  PaymentScreen: PaymentScreenProps;
};

type PaymentScreenRouteProp = RouteProp<
  PaymentScreenParamList,
  "PaymentScreen"
>;

//@deprecated use StripePayment
const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentScreenRouteProp>();
  const { navigate, goBack } = useCustomNavigation();
  const notify = useNotify();

  // Estados principales
  const [selectedMethod, setSelectedMethod] = useState<
    "payphone" | "becoin" | "bank_transfer"
  >("becoin");
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [appliedRedemption, setAppliedRedemption] = useState<
    Redemption | RealUserResource | null
  >(null);
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [discountedAmount, setDiscountedAmount] = useState<number>(0);
  const [isFreeEntry, setIsFreeEntry] = useState(false);
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscountsModal, setShowDiscountsModal] = useState(false);

  // Hook para obtener recursos del usuario
  // const {
  //   userResources,
  //   loading: userResourcesLoading,
  //   error: userResourcesError,
  // } = useUserResources();

  const { paymentData, amount_to_payment_id } = route.params;

  // Si venimos desde el QRScanner con una redención pendiente, aplicarla automáticamente
  // Calculamos directamente usando el monto que viene en paymentData para evitar
  // condiciones de carrera con el estado `originalAmount`.
  useEffect(() => {
    const pending = (paymentData as any)?.appliedRedemption;
    if (pending && !appliedRedemption) {
      try {
        const base = Number(paymentData.amount) || 0;
        // Setear originalAmount inmediatamente
        setOriginalAmount(base);

        // Normalizar y calcular descuento según la forma del pending
        let discountPercent = 0;
        if ("type" in pending && pending.type === "DISCOUNT") {
          discountPercent = Number(pending.value) || 0;
          if (discountPercent > 0 && discountPercent <= 1)
            discountPercent *= 100;
        } else if ("resource" in pending && (pending.resource as any)) {
          discountPercent = Number((pending.resource as any).discount) || 0;
          if (discountPercent > 0 && discountPercent <= 1)
            discountPercent *= 100;
        }

        const newAmount = base * (1 - discountPercent / 100);
        const rounded = Math.max(0, Number(newAmount.toFixed(2)));

        setAppliedRedemption(pending as any);
        setDiscountedAmount(discountPercent >= 100 ? 0 : rounded);
        // Actualizar el estado `amount` mostrado en la UI para montos fijos
        // Esto evita que la UI muestre el saldo antiguo si otro efecto se
        // ejecuta en distinto orden. Solo actualizar cuando el QR trae un monto fijo
        // (no cuando el usuario puede editar el monto)
        try {
          const isFixedAmountLocal = Number(paymentData.amount) > 0;
          if (isFixedAmountLocal) {
            const displayValue = discountPercent >= 100 ? 0 : rounded;
            setAmount(String(displayValue));
          }
        } catch (err) {
          // ignore
        }
        setIsFreeEntry(discountPercent >= 100);
        // pending applied (silent)
      } catch (err) {
        // ignore error applying pending redemption
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData.amount]);

  // Loguear paymentData al entrar para depuración
  useEffect(() => {
    // initial mount: no-op for logging in production
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comercioNombre = paymentData.commerce_name || "Comercio Beland";
  const defaultProfileImg =
    "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
  const comercioImg = paymentData.commerce_img || defaultProfileImg;

  const PRESET_AMOUNTS = [10, 25, 50, 100, 200, 500];
  const BECOIN_TO_USD_RATE = 0.05; // 1 BeCoin = $0.05 USD

  // Funciones de conversión
  const usdToBeCoins = (usdAmount: number): number => {
    return Math.ceil(usdAmount / BECOIN_TO_USD_RATE); // Redondear hacia arriba
  };

  const beCoinsToUsd = (beCoins: number): number => {
    return beCoins * BECOIN_TO_USD_RATE;
  };

  // Inicializar montos originales
  // Helper: calcula monto descontado a partir de un original y una redención
  const computeDiscountFrom = (
    original: number,
    redemption: Redemption | RealUserResource | null,
  ) => {
    if (!redemption) {
      // computeDiscountFrom -> no redemption
      return { discounted: original, free: false };
    }
    // Manejar cupones tradicionales
    if ("type" in redemption && redemption.type === "DISCOUNT") {
      let discountPercent = Number(redemption.value) || 0;
      if (discountPercent > 0 && discountPercent <= 1) discountPercent *= 100;
      const newAmount = original * (1 - discountPercent / 100);
      const rounded = Math.max(0, Number(newAmount.toFixed(2)));
      // computeDiscountFrom -> coupon
      return {
        discounted: discountPercent >= 100 ? 0 : rounded,
        free: discountPercent >= 100,
      };
    }

    // Manejar user resource
    if ("resource" in redemption && (redemption.resource as any)) {
      const disc = Number((redemption.resource as any).discount) || 0;
      let discountPercent = disc;
      if (discountPercent > 0 && discountPercent <= 1) discountPercent *= 100;
      const newAmount = original * (1 - discountPercent / 100);
      const rounded = Math.max(0, Number(newAmount.toFixed(2)));
      // computeDiscountFrom -> user resource
      return {
        discounted: discountPercent >= 100 ? 0 : rounded,
        free: discountPercent >= 100,
      };
    }

    // computeDiscountFrom -> fallback
    return { discounted: original, free: false };
  };

  // Inicializar montos originales
  // IMPORTANTE: incluir `appliedRedemption` en las dependencias para que
  // cuando se establezca una redención (p.ej. viene adjunta desde el QR)
  // se vuelva a calcular `discountedAmount` y `isFreeEntry` y no sea
  // sobrescrito por otro efecto que también depende de `paymentData.amount`.
  useEffect(() => {
    const base = Number(paymentData.amount);
    setOriginalAmount(base);
    // Si ya hay una redención aplicada (p.ej. viene del QR), calcular usando el monto base
    if (appliedRedemption) {
      const { discounted, free } = computeDiscountFrom(base, appliedRedemption);
      setDiscountedAmount(discounted);
      setIsFreeEntry(!!free);
    } else {
      setDiscountedAmount(base);
    }
  }, [paymentData.amount, appliedRedemption]);

  // Función para aplicar redención
  const applyRedemption = (redemption: Redemption | RealUserResource) => {
    if (appliedRedemption?.id === redemption.id) {
      // Si ya está aplicada, la removemos
      setAppliedRedemption(null);
      setDiscountedAmount(originalAmount);
      setIsFreeEntry(false);
      return;
    }

    // applyRedemption invoked
    setAppliedRedemption(redemption);
    // Calcular con helper usando el original actual
    const { discounted, free } = computeDiscountFrom(
      originalAmount,
      redemption as any,
    );
    // computed discount applied
    setDiscountedAmount(discounted);
    setIsFreeEntry(!!free);
  };

  const isPresetFreeEntry =
    Number(paymentData.amount) === 0 && !!paymentData.amount_to_payment_id;
  const isEditableZero =
    Number(paymentData.amount) === 0 && !paymentData.amount_to_payment_id;
  const isFixedAmount = Number(paymentData.amount) > 0;

  const canEdit = isEditableZero;

  // Función para obtener el monto efectivo a pagar
  const getEffectiveAmount = (): number => {
    // Si el usuario puede editar el monto (QR sin monto), usar el valor ingresado
    if (canEdit && amount) {
      const userAmount = Number(amount);
      // Si hay descuento aplicado, calcularlo sobre el monto ingresado por el usuario
      if (appliedRedemption) {
        if (
          "type" in appliedRedemption &&
          appliedRedemption.type === "DISCOUNT"
        ) {
          const discountPercent = appliedRedemption.value;
          return Math.max(0, userAmount * (1 - discountPercent / 100));
        } else if (
          "resource" in appliedRedemption &&
          appliedRedemption.resource &&
          appliedRedemption.resource.discount
        ) {
          const discountPercent = appliedRedemption.resource.discount;
          return Math.max(0, userAmount * (1 - discountPercent / 100));
        }
      }
      return userAmount;
    }
    // Para montos fijos del QR, usar la lógica original
    return appliedRedemption ? discountedAmount : originalAmount;
  };

  // Inicializar amount
  useEffect(() => {
    if (isPresetFreeEntry) {
      setAmount("0");
    } else if (isFixedAmount) {
      setAmount(String(getEffectiveAmount()));
    } else {
      setAmount("");
    }
  }, [isPresetFreeEntry, isFixedAmount]);

  // Actualizar amount cuando se aplica/remueve redención
  useEffect(() => {
    if (isFixedAmount) {
      setAmount(String(getEffectiveAmount()));
    }
  }, [appliedRedemption, discountedAmount, originalAmount, isFixedAmount]);

  const isAmountValid =
    !canEdit ||
    (amount &&
      !isNaN(Number(amount)) &&
      Number(amount) >= 1 &&
      Number(amount) <= 999999);

  // Lógica mejorada para canPay que considera entrada gratuita por descuentos
  const canPay =
    isFreeEntry || // Si es entrada gratuita por descuento, siempre permitir
    (isPresetFreeEntry && amount === "0") || // Entrada gratuita preset
    (canEdit && isAmountValid) || // Monto editable y válido
    (!canEdit && amount && Number(amount) > 0 && Number(amount) <= 999999) || // Monto fijo válido
    (appliedRedemption && discountedAmount >= 0); // Si hay descuento aplicado, permitir

  // Validar si Payphone está disponible (monto mínimo $1.00)
  const effectiveAmount = getEffectiveAmount();
  const isPayphoneAvailable = effectiveAmount >= 1.0 && !isFreeEntry;
  const shouldForceBeCoins =
    !isFreeEntry && effectiveAmount > 0 && effectiveAmount < 1.0;

  // Auto-seleccionar BeCoins si Payphone no está disponible
  React.useEffect(() => {
    if (shouldForceBeCoins && selectedMethod === "payphone") {
      setSelectedMethod("becoin");
    }
  }, [shouldForceBeCoins, selectedMethod]);

  // Función para cargar el script Payphone en web
  function loadPayphoneScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!document.getElementById("payphone-css")) {
        const link = document.createElement("link");
        link.id = "payphone-css";
        link.rel = "stylesheet";
        link.href =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
        document.head.appendChild(link);
      }
      // @ts-ignore
      if (window.PPaymentButtonBox) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("No se pudo cargar el script de Payphone."));
      document.body.appendChild(script);
    });
  }

  // Función para manejar Payphone Web
  const handlePayphoneWeb = async () => {
    console.log("[Payphone] paymentData:", paymentData);

    // Guardar datos QR en sessionStorage para PayphoneSuccessScreen
    if (paymentData.wallet_id || paymentData.amount_to_payment_id) {
      sessionStorage.setItem(
        "payphone_to_wallet_id",
        paymentData.wallet_id || "",
      );
      sessionStorage.setItem(
        "payphone_amount_to_payment_id",
        paymentData.amount_to_payment_id || "",
      );

      // Guardar información de redención aplicada
      if (appliedRedemption) {
        sessionStorage.setItem(
          "payphone_applied_redemption",
          JSON.stringify({
            id: appliedRedemption.id,
            code:
              "code" in appliedRedemption
                ? appliedRedemption.code
                : appliedRedemption.resource?.name || "Descuento",
            value:
              "value" in appliedRedemption
                ? appliedRedemption.value
                : appliedRedemption.resource?.discount || 0,
            original_amount: originalAmount,
            discounted_amount: getEffectiveAmount(),
            is_free_entry: isFreeEntry,
          }),
        );
      } else {
        sessionStorage.removeItem("payphone_applied_redemption");
      }

      console.log("[Payphone][SessionStorage] Set QR Payment:", {
        wallet_id: paymentData.wallet_id,
        amount_to_payment_id: paymentData.amount_to_payment_id,
        applied_redemption:
          "code" in (appliedRedemption || {})
            ? (appliedRedemption as Redemption)?.code
            : "none",
      });
    } else {
      sessionStorage.removeItem("payphone_to_wallet_id");
      sessionStorage.removeItem("payphone_amount_to_payment_id");
      sessionStorage.removeItem("payphone_applied_redemption");
      console.log("[Payphone][SessionStorage] Limpieza de datos QR");
    }

    // Si es entrada gratis, procesar directamente sin Payphone
    if (isFreeEntry) {
      try {
        const freeEntryData: any = {
          toWalletId: paymentData.wallet_id,
          amountBecoin: 0,
        };

        if (paymentData.amount_to_payment_id) {
          freeEntryData.amount_payment_id = paymentData.amount_to_payment_id;
        }

        if (
          Array.isArray(paymentData.resource) &&
          paymentData.resource.length > 0 &&
          paymentData.resource[0].id
        ) {
          freeEntryData.user_resource_id = paymentData.resource[0].id;
        }

        if (appliedRedemption) {
          freeEntryData.applied_redemption_id = appliedRedemption.id;
          if ("value" in appliedRedemption) {
            freeEntryData.redemption_discount = appliedRedemption.value;
          } else {
            freeEntryData.redemption_discount =
              appliedRedemption.resource?.discount || 0;
          }
          freeEntryData.original_amount = originalAmount;
          freeEntryData.discounted_amount = 0;
        }

        // Agregar información adicional para notificación
        if (
          Array.isArray(paymentData.resource) &&
          paymentData.resource.length > 0
        ) {
          freeEntryData.resource_name = paymentData.resource[0].resource_name;
          freeEntryData.resource_quantity =
            paymentData.resource[0].resource_quanity;
        }

        // Preparar datos adicionales para notificación (no van al backend)
        const notificationData: {
          transaction_type:
            | "payphone"
            | "becoin"
            | "redemption_applied"
            | "free_entry";
          commerce_name: string;
          becoins_used: number;
          resource_name: any;
          resource_quantity: any;
          redemption_code?: string;
        } = {
          transaction_type: appliedRedemption
            ? "redemption_applied"
            : "free_entry",
          commerce_name: paymentData.commerce_name || "Comercio Beland",
          becoins_used: 0,
          resource_name: freeEntryData.resource_name,
          resource_quantity: freeEntryData.resource_quantity,
        };

        if (appliedRedemption) {
          notificationData.redemption_code =
            "code" in appliedRedemption
              ? appliedRedemption.code
              : appliedRedemption.resource?.name || "Descuento";
        }

        // Solo enviar campos que acepta el backend DTO
        const backendData = {
          toWalletId: freeEntryData.toWalletId,
          amountUsd: freeEntryData.amountBecoin,
          amount_payment_id: freeEntryData.amount_payment_id,
          user_resource_id: freeEntryData.user_resource_id,
        };

        const response = await WalletService.createPurchaseBecoin(backendData);
        setBackendResponse(response);

        // Guardar contexto de transacción para enriquecer notificaciones
        const contextManager = TransactionContextManager.getInstance();
        contextManager.addTransaction({
          timestamp: Date.now(),
          amount: 0,
          type: notificationData.transaction_type,
          resourceName: notificationData.resource_name,
          resourceQuantity: notificationData.resource_quantity,
          redemptionCode: notificationData.redemption_code,
          becoinsUsed: notificationData.becoins_used,
          commerceName: notificationData.commerce_name,
        });

        // Mostrar alerta según noHidden del backend o del paymentData
        const shouldStayVisible = response?.noHidden || paymentData.noHidden;
        if (shouldStayVisible) {
          notify.info(response.message);
        }
        setIsLoading(false);
        return;
      } catch (error) {
        const message = getBackendErrorMessage(error);
        notify.error({ message });
        setIsLoading(false);
        return;
      }
    }

    if (!isAmountValid) {
      setAmountError("El monto debe ser un número entre 1 y 999999");
      return;
    }

    setIsLoading(true);
    setAmountError(null);

    const ppDiv = document.getElementById("pp-button");
    if (ppDiv) ppDiv.innerHTML = "";

    try {
      await loadPayphoneScript();
      const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;
      localStorage.setItem("payphone_token", payphoneToken);

      // @ts-ignore
      const payphoneConfig = {
        token: payphoneToken,
        clientTransactionId: `TX-${Date.now()}`,
        amount: Math.round(getEffectiveAmount() * 100), // Asegurar que sea un entero
        amountWithoutTax: Math.round(getEffectiveAmount() * 100), // Asegurar que sea un entero
        currency: "USD",
        storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
        reference: appliedRedemption
          ? `Pago QR Beland - Cupón: ${
              "code" in appliedRedemption
                ? appliedRedemption.code
                : appliedRedemption.resource?.name || "Descuento"
            }`
          : "Pago QR Beland",
        callback: `${window.location.origin}/wallet/payphone-success`,
      };

      console.log("[Payphone] Config enviado:", {
        amount: payphoneConfig.amount,
        amountWithoutTax: payphoneConfig.amountWithoutTax,
        effectiveAmount: getEffectiveAmount(),
        userAmount: amount,
        canEdit: canEdit,
      });
      // @ts-ignore
      new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
    } catch (err) {
      const message = getBackendErrorMessage(err);
      notify.error({ message });
      setIsLoading(false);
    }
  };

  // Función para manejar pago con BeCoins
  const handleBeCoinsPayment = async () => {
    if (!canPay || isLoading) return;

    try {
      setIsLoading(true);
      const effectiveAmount = getEffectiveAmount();
      const beCoinsAmount = isFreeEntry ? 0 : usdToBeCoins(effectiveAmount);

      const purchaseData: any = {
        toWalletId: paymentData.wallet_id,
        amountUsd: paymentData.amount,
      };

      if (paymentData.amount_to_payment_id) {
        purchaseData.amount_payment_id = paymentData.amount_to_payment_id;
      }

      // if (
      //   Array.isArray(paymentData.resource) &&
      //   paymentData.resource.length > 0 &&
      //   paymentData.resource[0].id
      // ) {
      //   purchaseData.user_resource_id = paymentData.resource[0].id;
      // }

      // Agregar información de redención aplicada
      // if (appliedRedemption) {
      //   purchaseData.applied_redemption_id = appliedRedemption.id;
      //   if ("value" in appliedRedemption) {
      //     purchaseData.redemption_discount = appliedRedemption.value;
      //   } else {
      //     purchaseData.redemption_discount =
      //       appliedRedemption.resource?.discount || 0;
      //   }
      //   purchaseData.original_amount = originalAmount;
      //   purchaseData.discounted_amount = effectiveAmount;
      // }

      // Agregar información adicional para notificación
      // if (
      //   Array.isArray(paymentData.resource) &&
      //   paymentData.resource.length > 0
      // ) {
      //   purchaseData.resource_name = paymentData.resource[0].resource_name;
      //   purchaseData.resource_quantity =
      //     paymentData.resource[0].resource_quanity;
      // }

      // Preparar datos adicionales para notificación (no van al backend)
      const notificationData: {
        transaction_type:
          | "payphone"
          | "becoin"
          | "redemption_applied"
          | "free_entry";
        commerce_name: string;
        becoins_used: number;
        resource_name: any;
        resource_quantity: any;
        redemption_code?: string;
      } = {
        transaction_type: isFreeEntry ? "free_entry" : "becoin",
        commerce_name: paymentData.commerce_name || "Comercio Beland",
        becoins_used: beCoinsAmount,
        resource_name: purchaseData.resource_name,
        resource_quantity: purchaseData.resource_quantity,
      };

      if (appliedRedemption) {
        notificationData.transaction_type = "redemption_applied";
        notificationData.redemption_code =
          "code" in appliedRedemption
            ? appliedRedemption.code
            : appliedRedemption.resource?.name || "Descuento";
      }

      // Solo enviar campos que acepta el backend DTO
      const backendData = {
        toWalletId: purchaseData.toWalletId,
        amountUsd: paymentData.amount,
        amount_payment_id: purchaseData.amount_payment_id,
      };
      const response = await WalletService.createPurchaseBecoin(backendData);

      // Guardar contexto de transacción para enriquecer notificaciones
      const contextManager = TransactionContextManager.getInstance();
      contextManager.addTransaction({
        timestamp: Date.now(),
        amount: effectiveAmount,
        type: notificationData.transaction_type,
        resourceName: notificationData.resource_name,
        resourceQuantity: notificationData.resource_quantity,
        redemptionCode: notificationData.redemption_code,
        becoinsUsed: notificationData.becoins_used,
        commerceName: notificationData.commerce_name,
      });

      setBackendResponse(response);
      notify.success({ message: "Compra realizada con exito" });
      navigate("MainTabs", { screen: "Home" });
    } catch (err) {
      const message = getBackendErrorMessage(err);
      notify.error({ message });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar entrada gratuita
  const handleFreeEntry = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const purchaseData: any = {
        toWalletId: paymentData.wallet_id,
        amountBecoin: 0,
      };

      if (paymentData.amount_to_payment_id) {
        purchaseData.amount_payment_id = paymentData.amount_to_payment_id;
      }

      if (
        Array.isArray(paymentData.resource) &&
        paymentData.resource.length > 0 &&
        paymentData.resource[0].id
      ) {
        purchaseData.user_resource_id = paymentData.resource[0].id;
      }

      // Agregar información adicional para notificación
      if (
        Array.isArray(paymentData.resource) &&
        paymentData.resource.length > 0
      ) {
        purchaseData.resource_name = paymentData.resource[0].resource_name;
        purchaseData.resource_quantity =
          paymentData.resource[0].resource_quanity;
      }

      // Preparar datos adicionales para notificación (no van al backend)
      const notificationData = {
        transaction_type: "free_entry" as const,
        commerce_name: paymentData.commerce_name || "Comercio Beland",
        becoins_used: 0,
        resource_name: purchaseData.resource_name,
        resource_quantity: purchaseData.resource_quantity,
      };

      // Solo enviar campos que acepta el backend DTO
      const backendData = {
        toWalletId: purchaseData.toWalletId,
        amountUsd: purchaseData.amountBecoin,
        amount_payment_id: purchaseData.amount_payment_id,
        user_resource_id: purchaseData.user_resource_id,
      };

      const response = await WalletService.createPurchaseBecoin(backendData);
      setBackendResponse(response);

      // Guardar contexto de transacción
      const contextManager = TransactionContextManager.getInstance();
      contextManager.addTransaction({
        timestamp: Date.now(),
        amount: 0,
        type: notificationData.transaction_type,
        resourceName: notificationData.resource_name,
        resourceQuantity: notificationData.resource_quantity,
        becoinsUsed: notificationData.becoins_used,
        commerceName: notificationData.commerce_name,
      });
      notify.success({ message: "Entrada gratuita realizada con exito" });
      navigate("MainTabs", { screen: "Home" });
    } catch (err) {
      const message = getBackendErrorMessage(err);
      notify.error({ message });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular total de descuentos disponibles
  const totalDiscounts =
    (paymentData.resource?.length || 0) +
    (paymentData.redemptions?.length || 0);
  // +
  // (userResources?.length || 0);
  return (
    <>
      <ThemedHeader title="Abonar" canGoBack />
      <ScrollView>
        <View className="mx-6">
          <PaymentHeader
            commerceImg={comercioImg}
            commerceName={comercioNombre}
          />
        </View>
        <View className="gap-2 bg-background-light rounded-lg p-6 mx-6 items-center">
          <Text className="text-lg font-semibold">
            Abonaras: Usd$ {paymentData.amount}
          </Text>
          <Text className="italic">A {paymentData.full_name}</Text>
          <View className="flex flex-row items-center justify-center gap-2 ">
            <Button
              title="Cancelar"
              variant="ghost"
              className="secondary-button"
              onPress={goBack}
            />
            <Button
              title="Pagar"
              onPress={handleBeCoinsPayment}
              disabled={!canPay || isLoading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de descuentos */}
      {/* <DiscountsModal
        isVisible={showDiscountsModal}
        onClose={() => setShowDiscountsModal(false)}
        paymentDataResource={paymentData.resource}
        paymentDataRedemptions={paymentData.redemptions}
        userResources={userResources}
        appliedRedemption={appliedRedemption}
        onApplyRedemption={(redemption: Redemption | RealUserResource) => {
          applyRedemption(redemption);
          setShowDiscountsModal(false);
        }}
      /> */}

      {/* Modal de transferencia bancaria */}
      <BankTransferModal
        visible={showBankTransferModal}
        onClose={() => setShowBankTransferModal(false)}
      />
    </>
  );
};

export default PaymentScreen;
