import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CreditCard, Building2, ArrowLeft, Shield } from "lucide-react-native";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { convertBeCoinsToUSD, formatUSDPrice } from "src/constants/currency";
import { colors } from "src/styles";

// Montos predefinidos en USD
const PRESET_AMOUNTS = [50, 100, 200, 500];
const PAYMENT_METHODS = [
  { id: "PAYPHONE", name: "Tarjeta de Crédito", icon: "credit-card" },
  { id: "BANK_TRANSFER", name: "Transferencia Bancaria", icon: "building" },
];

// Función para cargar el script Payphone en web
function loadPayphoneScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cargar CSS solo una vez
    if (!document.getElementById("payphone-css")) {
      const link = document.createElement("link");
      link.id = "payphone-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
      document.head.appendChild(link);
    }
    // Cargar JS solo una vez
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

export default function RechargeScreen() {
  const { goBack } = useCustomNavigation();

  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- RENDER WEB ---
  if (Platform.OS === "web") {
    const beCoinsAmount = amount ? Math.floor(Number(amount) / 0.05) : 0;
    const usdAmount = Number(amount) || 0;
    const processingFee = 0;
    const totalAmount = usdAmount + processingFee;

    return (
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
          padding: 0,
          fontFamily: "'Inter', 'Roboto', 'Segoe UI', sans-serif",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "40px auto",
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #F88D2A 0%, #e67a1a 100%)",
              padding: "32px 24px",
              position: "relative",
            }}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                marginBottom: 16,
                transition: "all 0.2s",
              }}
              onClick={() => window.history.back()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
            >
              ← Volver
            </button>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                marginBottom: 8,
              }}
            >
              Recargar BeCoins
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.9)",
                margin: 0,
              }}
            >
              Elige tu monto y método de pago
            </p>
          </div>

          <div style={{ padding: 32 }}>
            {/* Main Amount Input */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "2px solid #F88D2A",
                padding: "24px",
                marginBottom: 24,
                boxShadow: "0 4px 16px rgba(248,141,42,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#666",
                  marginBottom: 12,
                  display: "block",
                  textAlign: "center",
                }}
              >
                Ingresa el monto en USD
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#F88D2A",
                  }}
                >
                  $
                </span>
                <input
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: "#333",
                    border: "none",
                    borderBottom: "3px solid #F88D2A",
                    outline: "none",
                    background: "transparent",
                    width: 200,
                    textAlign: "center",
                    padding: "4px 8px",
                    appearance: "textfield",
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setAmount(val);
                  }}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onKeyDown={(e) =>
                    (e.key === "-" || e.key === "+" || e.key === "e") &&
                    e.preventDefault()
                  }
                  onInput={(e) => {
                    // Force color on autofill
                    (e.target as HTMLInputElement).style.color = "#333";
                  }}
                />
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#6ba43a",
                  }}
                >
                  USD
                </span>
              </div>
            </div>

            {/* Preset Amounts */}
            <div style={{ marginBottom: 24 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#333",
                  marginBottom: 12,
                  display: "block",
                }}
              >
                Montos rápidos
              </span>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {PRESET_AMOUNTS.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    style={{
                      flex: "1 1 22%",
                      padding: "16px 0",
                      background:
                        amount === presetAmount.toString()
                          ? "#F88D2A"
                          : "#f8f9fa",
                      color:
                        amount === presetAmount.toString() ? "#fff" : "#495057",
                      border: "2px solid",
                      borderColor:
                        amount === presetAmount.toString()
                          ? "#F88D2A"
                          : "#e9ecef",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => setAmount(presetAmount.toString())}
                    onMouseEnter={(e) => {
                      if (amount !== presetAmount.toString()) {
                        e.currentTarget.style.borderColor = "#F88D2A";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (amount !== presetAmount.toString()) {
                        e.currentTarget.style.borderColor = "#e9ecef";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    ${presetAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: 24 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#333",
                  marginBottom: 12,
                  display: "block",
                }}
              >
                Método de pago
              </span>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "18px 16px",
                      background:
                        selectedPaymentMethod === method.id
                          ? "#fff8f0"
                          : "#f8f9fa",
                      border: "2px solid",
                      borderColor:
                        selectedPaymentMethod === method.id
                          ? "#F88D2A"
                          : "#e9ecef",
                      borderRadius: 12,
                      fontWeight:
                        selectedPaymentMethod === method.id ? 700 : 500,
                      fontSize: 16,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      position: "relative",
                    }}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    onMouseEnter={(e) => {
                      if (selectedPaymentMethod !== method.id) {
                        e.currentTarget.style.borderColor = "#F88D2A";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPaymentMethod !== method.id) {
                        e.currentTarget.style.borderColor = "#e9ecef";
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                  >
                    <span style={{ fontSize: 20 }}>
                      {method.icon === "credit-card" ? "" : ""}
                    </span>
                    <span style={{ flex: 1, color: "#333" }}>
                      {method.name}
                    </span>
                    {selectedPaymentMethod === method.id && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          background: "#F88D2A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {amount && Number(amount) > 0 && (
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#333",
                    margin: "0 0 16px 0",
                  }}
                >
                  Resumen de la orden
                </h3>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 14, color: "#666" }}>
                    Monto de recarga
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#333" }}
                  >
                    ${usdAmount.toFixed(2)} USD
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 14, color: "#666" }}>
                    Comisión de procesamiento
                  </span>
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#333" }}
                  >
                    ${processingFee.toFixed(2)} USD
                  </span>
                </div>

                <div
                  style={{
                    height: 1,
                    background: "#e9ecef",
                    margin: "12px 0",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: "#333" }}
                  >
                    Total
                  </span>
                  <span
                    style={{ fontSize: 18, fontWeight: 700, color: "#F88D2A" }}
                  >
                    ${totalAmount.toFixed(2)} USD
                  </span>
                </div>

                <div
                  style={{
                    background: "#f0f9ff",
                    border: "1px solid rgba(107,164,58,0.3)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      color: "#333",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Recibirás{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#6ba43a",
                        fontSize: 18,
                      }}
                    >
                      {beCoinsAmount.toLocaleString()} BeCoins
                    </span>
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#666",
                      margin: "4px 0 0 0",
                    }}
                  >
                    1 BeCoin = $0.05 USD
                  </p>
                </div>
              </div>
            )}

            {/* Payphone button container */}
            {selectedPaymentMethod === "PAYPHONE" && (
              <div id="pp-button" style={{ marginBottom: 16 }}></div>
            )}

            {/* Proceed to Payment Button */}
            {!isLoading && (
              <button
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background:
                    !amount || !selectedPaymentMethod || Number(amount) === 0
                      ? "#ccc"
                      : "linear-gradient(135deg, #F88D2A 0%, #e67a1a 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  padding: "18px 0",
                  borderRadius: 12,
                  border: "none",
                  boxShadow:
                    !amount || !selectedPaymentMethod || Number(amount) === 0
                      ? "none"
                      : "0 4px 16px rgba(248,141,42,0.3)",
                  cursor:
                    !amount || !selectedPaymentMethod || Number(amount) === 0
                      ? "not-allowed"
                      : "pointer",
                  marginBottom: 12,
                  transition: "all 0.2s",
                }}
                onClick={async () => {
                  if (!amount || !selectedPaymentMethod || Number(amount) === 0)
                    return;

                  if (selectedPaymentMethod === "PAYPHONE") {
                    // Limpiar variables QR antes de iniciar recarga
                    localStorage.removeItem("payphone_to_wallet_id");
                    localStorage.removeItem("payphone_amount_to_payment_id");
                    localStorage.removeItem("payphone_is_qr_payment");
                    sessionStorage.removeItem("payphone_to_wallet_id");
                    sessionStorage.removeItem("payphone_amount_to_payment_id");
                    const ppDiv = document.getElementById("pp-button");
                    if (ppDiv) ppDiv.innerHTML = "";
                    setIsLoading(true);
                    setTimeout(async () => {
                      try {
                        await loadPayphoneScript();
                        const payphoneToken =
                          process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;
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
                        new window.PPaymentButtonBox(payphoneConfig).render(
                          "pp-button"
                        );
                      } catch (err) {
                        alert("No se pudo cargar el widget de Payphone.");
                        setIsLoading(false);
                      }
                    }, 0);
                  } else {
                    alert("Función en desarrollo para este método de pago");
                  }
                }}
                onMouseEnter={(e) => {
                  if (amount && selectedPaymentMethod && Number(amount) > 0) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(248,141,42,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (amount && selectedPaymentMethod && Number(amount) > 0) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(248,141,42,0.3)";
                  }
                }}
              >
                Proceder al pago
              </button>
            )}

            <p
              style={{
                fontSize: 13,
                color: "#666",
                textAlign: "center",
                margin: 0,
              }}
            >
              🔒 Pago seguro encriptado
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MÓVIL ---
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Recargar BeCoins</Text>
          <Text style={styles.subtitle}>Elige tu monto y método de pago</Text>
        </View>
      </View>

      {/* Monto personalizado - Input principal */}
      <View style={styles.mainAmountSection}>
        <Text style={styles.mainAmountLabel}>Ingresa el monto en USD</Text>
        <View style={styles.mainInputContainer}>
          <Text style={styles.mainCurrencySymbol}>$</Text>
          <TextInput
            style={styles.mainAmountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            maxLength={10}
            placeholderTextColor="#ccc"
          />
          <Text style={styles.mainCurrencyLabel}>USD</Text>
        </View>
      </View>

      {/* Montos predefinidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Montos rápidos</Text>
        <View style={styles.presetGrid}>
          {PRESET_AMOUNTS.map((presetAmount) => (
            <TouchableOpacity
              key={presetAmount}
              style={[
                styles.presetButton,
                amount === presetAmount.toString() &&
                  styles.presetButtonSelected,
              ]}
              onPress={() => setAmount(presetAmount.toString())}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  amount === presetAmount.toString() &&
                    styles.presetButtonTextSelected,
                ]}
              >
                ${presetAmount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Métodos de pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de pago</Text>
        <View style={styles.paymentMethodsContainer}>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === "PAYPHONE" &&
                styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedPaymentMethod("PAYPHONE")}
          >
            <CreditCard
              size={24}
              color={
                selectedPaymentMethod === "PAYPHONE"
                  ? colors.belandOrange
                  : "#666"
              }
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === "PAYPHONE" &&
                  styles.paymentMethodTextSelected,
              ]}
            >
              Tarjeta de Crédito
            </Text>
            {selectedPaymentMethod === "PAYPHONE" && (
              <View style={styles.checkmark}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === "BANK_TRANSFER" &&
                styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedPaymentMethod("BANK_TRANSFER")}
          >
            <Building2
              size={24}
              color={
                selectedPaymentMethod === "BANK_TRANSFER"
                  ? colors.belandOrange
                  : "#666"
              }
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === "BANK_TRANSFER" &&
                  styles.paymentMethodTextSelected,
              ]}
            >
              Transferencia Bancaria
            </Text>
            {selectedPaymentMethod === "BANK_TRANSFER" && (
              <View style={styles.checkmark}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen de orden */}
      {amount && Number(amount) > 0 && (
        <View style={styles.orderSummary}>
          <Text style={styles.orderSummaryTitle}>Resumen de la orden</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monto de recarga</Text>
            <Text style={styles.summaryValue}>${amount} USD</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Comisión de procesamiento</Text>
            <Text style={styles.summaryValue}>$0.00 USD</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${amount} USD</Text>
          </View>

          <View style={styles.conversionBadge}>
            <Text style={styles.conversionText}>
              Recibirás{" "}
              <Text style={styles.conversionAmount}>
                {Math.floor(Number(amount) / 0.05)} BeCoins
              </Text>
            </Text>
            <Text style={styles.conversionNote}>1 BeCoin = $0.05 USD</Text>
          </View>
        </View>
      )}

      {/* Botón de recarga */}
      {isLoading ? (
        <View style={[styles.rechargeButton, styles.rechargeButtonDisabled]}>
          <Text style={styles.rechargeButtonText}>Procesando...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.rechargeButton,
            (!amount || !selectedPaymentMethod || Number(amount) === 0) &&
              styles.rechargeButtonDisabled,
          ]}
          disabled={!amount || !selectedPaymentMethod || Number(amount) === 0}
          onPress={() => {
            Alert.alert(
              "Función en desarrollo",
              "La recarga de BeCoins estará disponible próximamente"
            );
          }}
        >
          <Shield size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.rechargeButtonText}>Proceder al pago</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.securityNote}>🔒 Pago seguro encriptado</Text>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: colors.belandOrange,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },

  // Main amount input
  mainAmountSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  mainAmountLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  mainInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  mainCurrencySymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.belandOrange,
    marginRight: 8,
  },
  mainAmountInput: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    minWidth: 120,
    textAlign: "center",
    borderBottomWidth: 3,
    borderBottomColor: colors.belandOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mainCurrencyLabel: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 8,
  },

  // Section
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },

  // Preset amounts
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  presetButton: {
    flex: 1,
    minWidth: "22%",
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    alignItems: "center",
    justifyContent: "center",
  },
  presetButtonSelected: {
    backgroundColor: colors.belandOrange,
    borderColor: colors.belandOrange,
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#495057",
  },
  presetButtonTextSelected: {
    color: "#fff",
  },

  // Payment methods
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  paymentMethodSelected: {
    backgroundColor: "#fff8f0",
    borderColor: colors.belandOrange,
    borderWidth: 2,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
    marginLeft: 12,
  },
  paymentMethodTextSelected: {
    color: "#333",
    fontWeight: "700",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.belandOrange,
    alignItems: "center",
    justifyContent: "center",
  },

  // Order Summary
  orderSummary: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.belandOrange,
  },
  conversionBadge: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + "30",
    alignItems: "center",
  },
  conversionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  conversionAmount: {
    fontWeight: "bold",
    color: colors.primary,
    fontSize: 18,
  },
  conversionNote: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  // Recharge button
  rechargeButton: {
    flexDirection: "row",
    backgroundColor: colors.belandOrange,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.belandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rechargeButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  rechargeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  securityNote: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSpace: {
    height: 40,
  },

  // Legacy styles for success screen (if needed)
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
