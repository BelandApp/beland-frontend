import React, { useState, useEffect } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../components/layout/RootStackNavigator";
import { Alert } from "react-native";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { TransactionContextManager } from "../../hooks/usePaymentSocket";
import { useUserResources } from "../../hooks/useUserResources";
import { walletService } from "../../services/walletService";
import DiscountsButton from "./components/DiscountsButton";
import DiscountsModal from "./components/DiscountsModal";

// Importar estilos CSS
import "./styles/paymentScreenStyles.css";

// Importar estilos y componentes
import {
  containerStyles,
  amountStyles,
  couponStyles,
  discountBannerStyles,
  actionButtonStyles,
} from "./styles";

import {
  PaymentHeader,
  PaymentMethodSelector,
  PresetAmounts,
} from "./components";

// Importar tipos reales
import { UserResource as RealUserResource } from "../../types/resource";

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

type PaymentData = {
  commerce_name?: string;
  commerce_img?: string;
  amount: number;
  message?: string;
  resource?: Resource[];
  redemptions?: Redemption[];
  user_resources?: RealUserResource[];
  wallet_id?: string;
  amount_to_payment_id?: string | null;
  noHidden?: boolean;
};

type PaymentScreenParamList = {
  PaymentScreen: {
    paymentData: PaymentData;
    amount_to_payment_id?: string | null;
  };
};

type PaymentScreenRouteProp = RouteProp<
  PaymentScreenParamList,
  "PaymentScreen"
>;

const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentScreenRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Estados principales
  const [showFreeAlert, setShowFreeAlert] = useState(false);
  const [showPaymentSuccessAlert, setShowPaymentSuccessAlert] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"payphone" | "becoin">(
    "payphone"
  );
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
  const {
    userResources,
    loading: userResourcesLoading,
    error: userResourcesError,
  } = useUserResources();

  const { paymentData, amount_to_payment_id } = route.params;

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
  useEffect(() => {
    setOriginalAmount(Number(paymentData.amount));
    setDiscountedAmount(Number(paymentData.amount));
  }, [paymentData.amount]);

  // Función para aplicar redención
  const applyRedemption = (redemption: Redemption | RealUserResource) => {
    if (appliedRedemption?.id === redemption.id) {
      // Si ya está aplicada, la removemos
      setAppliedRedemption(null);
      setDiscountedAmount(originalAmount);
      setIsFreeEntry(false);
      return;
    }

    setAppliedRedemption(redemption);

    // Manejar diferentes tipos de redención
    if ("type" in redemption && redemption.type === "DISCOUNT") {
      const discountPercent = redemption.value;
      const newAmount = originalAmount * (1 - discountPercent / 100);
      setDiscountedAmount(Math.max(0, newAmount));

      // Si el descuento es 100%, es entrada gratis
      if (discountPercent >= 100) {
        setIsFreeEntry(true);
        setDiscountedAmount(0);
      } else {
        setIsFreeEntry(false);
      }
    } else if (
      "resource" in redemption &&
      redemption.resource &&
      redemption.resource.discount
    ) {
      // UserResource con descuento
      const discountPercent = redemption.resource.discount;
      const newAmount = originalAmount * (1 - discountPercent / 100);
      setDiscountedAmount(Math.max(0, newAmount));

      if (discountPercent >= 100) {
        setIsFreeEntry(true);
        setDiscountedAmount(0);
      } else {
        setIsFreeEntry(false);
      }
    }
  };

  // Función para obtener el monto efectivo a pagar
  const getEffectiveAmount = (): number => {
    return appliedRedemption ? discountedAmount : originalAmount;
  };

  const isPresetFreeEntry =
    Number(paymentData.amount) === 0 && !!paymentData.amount_to_payment_id;
  const isEditableZero =
    Number(paymentData.amount) === 0 && !paymentData.amount_to_payment_id;
  const isFixedAmount = Number(paymentData.amount) > 0;

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

  const canEdit = isEditableZero;
  const isAmountValid =
    !canEdit ||
    (/^\d+$/.test(amount) && Number(amount) >= 1 && Number(amount) <= 99999999);
  const canPay =
    isFreeEntry ||
    (canEdit && isAmountValid) ||
    (isPresetFreeEntry && amount === "0") ||
    (!canEdit && amount && Number(amount) >= 1 && Number(amount) <= 99999999);

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
        paymentData.wallet_id || ""
      );
      sessionStorage.setItem(
        "payphone_amount_to_payment_id",
        paymentData.amount_to_payment_id || ""
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
          })
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

        freeEntryData.transaction_type = "free_entry";
        if (appliedRedemption) {
          freeEntryData.transaction_type = "redemption_applied";
          freeEntryData.redemption_code =
            "code" in appliedRedemption
              ? appliedRedemption.code
              : appliedRedemption.resource?.name || "Descuento";
        }
        freeEntryData.commerce_name =
          paymentData.commerce_name || "Comercio Beland";
        freeEntryData.becoins_used = 0;

        const response = await walletService.createPurchaseBecoin(
          freeEntryData
        );
        setBackendResponse(response);

        // Guardar contexto de transacción para enriquecer notificaciones
        const contextManager = TransactionContextManager.getInstance();
        contextManager.addTransaction({
          timestamp: Date.now(),
          amount: 0,
          type: appliedRedemption ? "redemption_applied" : "free_entry",
          resourceName: freeEntryData.resource_name,
          resourceQuantity: freeEntryData.resource_quantity,
          redemptionCode:
            "code" in (appliedRedemption || {})
              ? (appliedRedemption as Redemption)?.code
              : undefined,
          becoinsUsed: 0,
          commerceName: freeEntryData.commerce_name,
        });

        // Mostrar alerta según noHidden del backend o del paymentData
        const shouldStayVisible = response?.noHidden || paymentData.noHidden;
        if (shouldStayVisible) {
          setShowFreeAlert(true);
        } else {
          setShowFreeAlert(true);
          setTimeout(() => {
            setShowFreeAlert(false);
            navigation.goBack();
          }, 2000);
        }
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("Error al procesar entrada gratis:", error);
        Alert.alert("Error", "No se pudo procesar la entrada gratis");
        setIsLoading(false);
        return;
      }
    }

    if (!isAmountValid) {
      setAmountError("El monto debe ser un entero entre 1 y 99999999");
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
        amount: getEffectiveAmount() * 100,
        amountWithoutTax: getEffectiveAmount() * 100,
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
      // @ts-ignore
      new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el widget de Payphone.");
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
        amountBecoin: beCoinsAmount,
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

      // Agregar información de redención aplicada
      if (appliedRedemption) {
        purchaseData.applied_redemption_id = appliedRedemption.id;
        if ("value" in appliedRedemption) {
          purchaseData.redemption_discount = appliedRedemption.value;
        } else {
          purchaseData.redemption_discount =
            appliedRedemption.resource?.discount || 0;
        }
        purchaseData.original_amount = originalAmount;
        purchaseData.discounted_amount = effectiveAmount;
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

      purchaseData.transaction_type = isFreeEntry ? "free_entry" : "paid_entry";
      if (appliedRedemption) {
        purchaseData.transaction_type = "redemption_applied";
        purchaseData.redemption_code =
          "code" in appliedRedemption
            ? appliedRedemption.code
            : appliedRedemption.resource?.name || "Descuento";
      }
      purchaseData.commerce_name =
        paymentData.commerce_name || "Comercio Beland";
      purchaseData.becoins_used = beCoinsAmount;

      const response = await walletService.createPurchaseBecoin(purchaseData);

      // Guardar contexto de transacción para enriquecer notificaciones
      const contextManager = TransactionContextManager.getInstance();
      contextManager.addTransaction({
        timestamp: Date.now(),
        amount: effectiveAmount,
        type: appliedRedemption ? "redemption_applied" : "becoin",
        resourceName: purchaseData.resource_name,
        resourceQuantity: purchaseData.resource_quantity,
        redemptionCode:
          "code" in (appliedRedemption || {})
            ? (appliedRedemption as Redemption)?.code
            : undefined,
        becoinsUsed: beCoinsAmount,
        commerceName: purchaseData.commerce_name,
      });

      setBackendResponse(response);
      setShowPaymentSuccessAlert(true);
    } catch (err) {
      setShowPaymentSuccessAlert(true);
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

      purchaseData.transaction_type = "free_entry";
      purchaseData.commerce_name =
        paymentData.commerce_name || "Comercio Beland";
      purchaseData.becoins_used = 0;

      const response = await walletService.createPurchaseBecoin(purchaseData);
      setBackendResponse(response);

      // Guardar contexto de transacción
      const contextManager = TransactionContextManager.getInstance();
      contextManager.addTransaction({
        timestamp: Date.now(),
        amount: 0,
        type: "free_entry",
        resourceName: purchaseData.resource_name,
        resourceQuantity: purchaseData.resource_quantity,
        becoinsUsed: 0,
        commerceName: purchaseData.commerce_name,
      });

      setShowFreeAlert(true);
    } catch (err) {
      setShowFreeAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular total de descuentos disponibles
  const totalDiscounts =
    (paymentData.resource?.length || 0) +
    (paymentData.redemptions?.length || 0) +
    (userResources?.length || 0);

  return (
    <>
      <div style={containerStyles.container}>
        <div style={containerStyles.scrollContainer} className="payment-scroll">
          <div style={containerStyles.content} className="payment-container">
            <div style={containerStyles.card} className="payment-card">
              <PaymentHeader
                commerceImg={comercioImg}
                commerceName={comercioNombre}
              />

              {/* Monto grande, centrado y profesional */}
              <div
                style={containerStyles.sectionCard}
                className="payment-section-card"
              >
                <div style={amountStyles.amountContainer}>
                  {canEdit ? (
                    <div>
                      <input
                        type="text"
                        value={
                          amount ? `$${Number(amount).toLocaleString()}` : ""
                        }
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => {
                          const val = e.target.value.replace(/[$,]/g, "");
                          if (/^\d{0,8}$/.test(val)) {
                            setAmount(val);
                            setAmountError(null);
                          } else if (val === "") {
                            setAmount("");
                            setAmountError(null);
                          } else {
                            setAmountError(
                              "Solo se permiten números del 1 al 99999999"
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]/.test(e.key) &&
                            ![
                              "Backspace",
                              "Delete",
                              "ArrowLeft",
                              "ArrowRight",
                              "Tab",
                            ].includes(e.key)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        style={amountStyles.amountInput}
                        className="no-spinner"
                        placeholder="$0.00"
                      />
                      {amountError && (
                        <div style={amountStyles.amountError}>
                          {amountError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={amountStyles.amountDisplay}>
                        {isPresetFreeEntry
                          ? "$0,00"
                          : Number(amount).toLocaleString("es-EC", {
                              style: "currency",
                              currency: "USD",
                            })}
                      </div>
                    </div>
                  )}

                  {isPresetFreeEntry && (
                    <div style={amountStyles.freeEntryBadge}>
                      ✨ Entrada Gratuita ✨
                    </div>
                  )}

                  <div style={amountStyles.amountDivider}></div>

                  {paymentData.message && (
                    <div style={amountStyles.messageText}>
                      {paymentData.message}
                    </div>
                  )}

                  {/* Información de conversión para BeCoins */}
                  {selectedMethod === "becoin" &&
                    amount &&
                    Number(amount) > 0 && (
                      <div style={amountStyles.conversionInfo}>
                        = {usdToBeCoins(Number(amount)).toLocaleString()}{" "}
                        BeCoins
                      </div>
                    )}
                </div>
              </div>

              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodChange={setSelectedMethod}
              />

              <PresetAmounts
                amounts={PRESET_AMOUNTS}
                selectedAmount={amount}
                onAmountSelect={(preset) => {
                  if (canEdit) {
                    setAmount(String(preset));
                    setAmountError(null);
                  }
                }}
                canEdit={canEdit}
              />

              {/* Botón de descuentos con modal */}
              <div className="discounts-button">
                <DiscountsButton
                  totalDiscounts={totalDiscounts}
                  onClick={() => setShowDiscountsModal(true)}
                />
              </div>

              {/* Descuento aplicado */}
              {appliedRedemption && (
                <div
                  style={containerStyles.gradientCard}
                  className="discount-banner"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        Cupón aplicado:{" "}
                        {"code" in appliedRedemption
                          ? appliedRedemption.code
                          : appliedRedemption.resource?.name || "Descuento"}
                      </div>
                      {"value" in appliedRedemption &&
                        appliedRedemption.type === "DISCOUNT" && (
                          <div style={{ fontSize: 12, opacity: 0.9 }}>
                            Descuento: {appliedRedemption.value}%
                          </div>
                        )}
                      {"resource" in appliedRedemption &&
                        appliedRedemption.resource &&
                        appliedRedemption.resource.discount && (
                          <div style={{ fontSize: 12, opacity: 0.9 }}>
                            Descuento: {appliedRedemption.resource.discount}%
                          </div>
                        )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>
                        Monto original: ${originalAmount.toFixed(2)}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {isFreeEntry
                          ? "¡GRATIS!"
                          : `Nuevo monto: $${discountedAmount.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción - Solo CSS, sin estilos inline */}
              <div className="action-buttons">
                {isPresetFreeEntry && amount === "0" ? (
                  <button
                    className={`primary-button free-entry-button ${
                      isLoading ? "loading" : ""
                    }`}
                    onClick={handleFreeEntry}
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : "Registrar entrada gratuita"}
                  </button>
                ) : selectedMethod === "payphone" ? (
                  <button
                    className={`primary-button payphone-button ${
                      !canPay || isLoading ? "disabled" : ""
                    } ${isLoading ? "loading" : ""}`}
                    onClick={handlePayphoneWeb}
                    disabled={!canPay || isLoading}
                  >
                    {isLoading
                      ? "Procesando..."
                      : isFreeEntry
                      ? "Ingresar gratis"
                      : "Pagar con Payphone"}
                  </button>
                ) : (
                  <button
                    className={`primary-button becoins-button ${
                      !canPay || isLoading ? "disabled" : ""
                    } ${isLoading ? "loading" : ""}`}
                    onClick={handleBeCoinsPayment}
                    disabled={!canPay || isLoading}
                  >
                    {isLoading
                      ? "Procesando..."
                      : isFreeEntry
                      ? "Ingresar gratis"
                      : `Pagar ${usdToBeCoins(
                          Number(amount || 0)
                        ).toLocaleString()} BeCoins`}
                  </button>
                )}

                <button
                  className="secondary-button"
                  onClick={() => navigation.goBack()}
                >
                  Cancelar
                </button>
              </div>

              {/* Widget Payphone */}
              {!isPresetFreeEntry && (
                <div style={{ width: "100%", marginTop: 24, minHeight: 60 }}>
                  <div id="pp-button" style={{ marginBottom: 16 }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de descuentos */}
      <DiscountsModal
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
      />

      {/* CustomAlert para entrada gratuita */}
      <CustomAlert
        visible={showFreeAlert}
        title={
          appliedRedemption
            ? "¡Cupón aplicado exitosamente!"
            : "Entrada gratuita registrada"
        }
        message={
          appliedRedemption
            ? `Tu cupón "${
                "code" in appliedRedemption
                  ? appliedRedemption.code
                  : appliedRedemption.resource?.name || "Descuento"
              }" fue aplicado correctamente. ¡Acceso gratis confirmado!`
            : "¡Tu acceso fue confirmado!"
        }
        type="success"
        primaryButton={{
          text:
            backendResponse?.noHidden || paymentData.noHidden
              ? "OK"
              : "Ir al inicio",
          onPress: () => {
            setShowFreeAlert(false);
            if (!(backendResponse?.noHidden || paymentData.noHidden)) {
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs", params: { screen: "Home" } }],
              });
            }
          },
        }}
        onClose={() => {
          setShowFreeAlert(false);
          if (!(backendResponse?.noHidden || paymentData.noHidden)) {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs", params: { screen: "Home" } }],
            });
          }
        }}
      />

      {/* CustomAlert para pago exitoso con BeCoins */}
      <CustomAlert
        visible={showPaymentSuccessAlert}
        title="¡Pago exitoso!"
        message={`Tu pago de ${usdToBeCoins(
          Number(amount || 0)
        ).toLocaleString()} BeCoins fue procesado correctamente.`}
        type="success"
        primaryButton={{
          text:
            backendResponse?.noHidden || paymentData.noHidden
              ? "OK"
              : "Ir al inicio",
          onPress: () => {
            setShowPaymentSuccessAlert(false);
            if (!(backendResponse?.noHidden || paymentData.noHidden)) {
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs", params: { screen: "Home" } }],
              });
            }
          },
        }}
        onClose={() => {
          setShowPaymentSuccessAlert(false);
          if (!(backendResponse?.noHidden || paymentData.noHidden)) {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs", params: { screen: "Home" } }],
            });
          }
        }}
      />
    </>
  );
};

export default PaymentScreen;
