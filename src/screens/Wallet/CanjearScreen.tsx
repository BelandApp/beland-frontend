import React, { useState } from "react";
import { Platform } from "react-native";
import { Modal, Pressable, FlatList } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Image } from "react-native";
// Si tienes lottie-react-native instalado, descomenta la siguiente línea:
// import LottieView from 'lottie-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "src/context";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { convertBeCoinsToUSD, formatUSDPrice } from "../../constants/currency";
import { WalletBalanceCard } from "./components/WalletBalanceCard";
import { beCoinsService } from "../../services/becoinsService";
import { transactionService } from "../../services/transactionService";

// Solo permitir canje de BECOINS a USD
const digitalCurrencies = [
  { label: "BECOINS", value: "becoin" },
  { label: "Dólar estadounidense (USD)", value: "usd" },
];

const CanjearScreen: React.FC<{
  navigation: any;
  route?: any;
  balance?: number;
}> = ({ navigation, route, balance: propBalance }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd"); // USD por defecto
  const [fromCurrency, setFromCurrency] = useState("becoin");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<
    "payphone" | "bank" | null
  >(null);
  const balance =
    useBeCoinsStore((state: { balance: number }) => state.balance) ?? 0;
  const spendBeCoins = useBeCoinsStore((state: any) => state.spendBeCoins);
  const { refetch } = require("./hooks/useWalletData");

  // Estado para modal de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    amount: number;
    currency: string;
    usdValue: string;
    opNumber: string;
    date: string;
  } | null>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const isAmountValid = parsedAmount > 0 && parsedAmount <= balance;
  const canContinue = isAmountValid && selectedWithdrawMethod;

  const withdrawMethods = [
    {
      id: "payphone",
      title: "Cuenta de Payphone",
      icon: "💳",
      available: true,
    },
    {
      id: "bank",
      title: "Cuenta Bancaria",
      icon: "🏦",
      available: true,
    },
  ];

  const handleBuy = async () => {
    if (!isAmountValid) {
      Alert.alert(
        "Monto inválido",
        "Por favor ingresa un monto válido dentro de tu saldo disponible."
      );
      return;
    }

    if (!selectedWithdrawMethod) {
      Alert.alert(
        "Selecciona un método",
        "Por favor selecciona dónde quieres recibir tu dinero."
      );
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "Usuario no autenticado");
      return;
    }

    // Aquí iría la lógica para procesar el retiro según el método seleccionado
    Alert.alert(
      "Funcionalidad en desarrollo",
      `Pronto podrás retirar ${formatUSDPrice(
        convertBeCoinsToUSD(parsedAmount)
      )} USD a tu ${
        selectedWithdrawMethod === "payphone"
          ? "cuenta de Payphone"
          : "cuenta bancaria"
      }`
    );
  };

  // Fuente estándar para toda la aplicación web
  const webFont =
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif";

  if (Platform.OS === "web") {
    return (
      <div
        style={{
          minHeight: "100vh",
          height: "100vh",
          backgroundColor: "#F8FAFC",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "24px 24px 20px 24px",
            marginBottom: 0,
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            borderRadius: "0 0 24px 24px",
            boxShadow: "0 4px 16px rgba(249, 115, 22, 0.2)",
            flexShrink: 0,
          }}
        >
          <button
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => {
              if (navigation && navigation.goBack) navigation.goBack();
              else window.history.back();
            }}
            aria-label="Volver"
          >
            <span
              style={{
                fontSize: 20,
                color: "#FFFFFF",
                fontWeight: "bold",
                fontFamily: webFont,
              }}
            >
              ←
            </span>
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: "#FFFFFF",
                letterSpacing: "0.5px",
                fontFamily: webFont,
              }}
            >
              Canjear BeCoins
            </span>
          </div>
        </div>

        {/* Contenedor principal con scroll */}
        <div
          style={{
            maxWidth: "640px",
            width: "100%",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            paddingBottom: "40px",
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingTop: "20px",
          }}
        >
          {/* Tarjeta de saldo */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: "1px solid #F1F5F9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#64748B",
                    fontWeight: "500",
                    marginBottom: "8px",
                    display: "block",
                    fontFamily: webFont,
                  }}
                >
                  Tu saldo disponible
                </span>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#1E293B",
                    marginBottom: "4px",
                    fontFamily: webFont,
                  }}
                >
                  {balance.toLocaleString()} BeCoins
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#64748B",
                    fontWeight: "500",
                    fontFamily: webFont,
                  }}
                >
                  ≈ ${formatUSDPrice(convertBeCoinsToUSD(balance))} USD
                </span>
              </div>
            </div>
          </div>

          {/* Contenedor con scroll para el resto del contenido */}
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              padding: "0 20px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            {/* Tarjeta de formulario */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                border: "1px solid #F1F5F9",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1E293B",
                  marginBottom: "20px",
                  display: "block",
                  fontFamily: webFont,
                }}
              >
                ¿Cuánto quieres canjear?
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#64748B",
                  marginBottom: "8px",
                  display: "block",
                  fontFamily: webFont,
                }}
              >
                Monto en BeCoins
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <input
                  style={{
                    flex: 1,
                    padding: "16px",
                    border: "2px solid #E5E7EB",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "#FAFAFA",
                    color: "#1E293B",
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: webFont,
                  }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  type="number"
                  maxLength={8}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F97316";
                    e.target.style.backgroundColor = "#FFFFFF";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.backgroundColor = "#FAFAFA";
                  }}
                />
                <span
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#FFF7ED",
                    border: "2px solid #FFEDD5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#F97316",
                    fontFamily: webFont,
                  }}
                >
                  BeCoins
                </span>
              </div>
              {/* Error */}
              {!isAmountValid && amount !== "" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 16px",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <span role="img" aria-label="alert" style={{ fontSize: 16 }}>
                    ⚠️
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#DC2626",
                      fontWeight: "500",
                      fontFamily: webFont,
                    }}
                  >
                    Monto inválido o insuficiente
                  </span>
                </div>
              )}

              {/* Conversión */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px",
                  backgroundColor: "#F0FDF4",
                  borderRadius: "16px",
                  border: "2px solid #BBF7D0",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#065F46",
                      fontWeight: "500",
                      fontFamily: webFont,
                      marginBottom: "4px",
                    }}
                  >
                    Recibirás
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "#059669",
                        fontFamily: webFont,
                        lineHeight: "1",
                      }}
                    >
                      $
                      {amount && isAmountValid
                        ? formatUSDPrice(convertBeCoinsToUSD(Number(amount)))
                        : "0.00"}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#065F46",
                        fontFamily: webFont,
                      }}
                    >
                      USD
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "#059669",
                    borderRadius: "50%",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "24px", color: "#FFFFFF" }}>💰</span>
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: "400",
                    fontFamily: webFont,
                  }}
                >
                  Conversión aproximada • Tasa: 1 BeCoin = $
                  {convertBeCoinsToUSD(1)} USD
                </span>
              </div>
              {/* Selección de método de retiro */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #F1F5F9",
                  marginTop: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#1E293B",
                    marginBottom: "20px",
                    display: "block",
                    fontFamily: webFont,
                  }}
                >
                  ¿Dónde querés recibir tu dinero?
                </span>

                {withdrawMethods.map((method) => (
                  <div
                    key={method.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px",
                      borderRadius: "12px",
                      border: `2px solid ${
                        selectedWithdrawMethod === method.id
                          ? "#F97316"
                          : "#E5E7EB"
                      }`,
                      backgroundColor:
                        selectedWithdrawMethod === method.id
                          ? "#FFF7ED"
                          : "#FAFAFA",
                      marginBottom: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() =>
                      setSelectedWithdrawMethod(
                        method.id as "payphone" | "bank"
                      )
                    }
                  >
                    <span
                      style={{
                        fontSize: 20,
                        marginRight: 16,
                        backgroundColor: "#F97316",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {method.icon}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: 600,
                        color:
                          selectedWithdrawMethod === method.id
                            ? "#F97316"
                            : "#374151",
                        fontFamily: webFont,
                      }}
                    >
                      {method.title}
                    </span>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${
                          selectedWithdrawMethod === method.id
                            ? "#F97316"
                            : "#D1D5DB"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedWithdrawMethod === method.id && (
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: "#F97316",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón de canje */}
              <button
                style={{
                  width: "100%",
                  padding: "16px",
                  backgroundColor:
                    !canContinue || isLoading ? "#D1D5DB" : "#F97316",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: !canContinue || isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  marginTop: "20px",
                  marginBottom: "20px",
                  fontFamily: webFont,
                  boxShadow:
                    !canContinue || isLoading
                      ? "none"
                      : "0 4px 16px rgba(249, 115, 22, 0.3)",
                }}
                onClick={handleBuy}
                disabled={!canContinue || isLoading}
                onMouseEnter={(e) => {
                  if (!(!canContinue || isLoading)) {
                    e.currentTarget.style.backgroundColor = "#EA580C";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!canContinue || isLoading)) {
                    e.currentTarget.style.backgroundColor = "#F97316";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {isLoading ? "Procesando..." : "Retirar dinero"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header profesional */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Canjear BeCoins</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Tu saldo disponible</Text>
              <Text style={styles.balanceAmount}>
                {balance.toLocaleString()} BeCoins
              </Text>
              <Text style={styles.balanceEstimate}>
                ≈ ${formatUSDPrice(convertBeCoinsToUSD(balance))} USD
              </Text>
            </View>
            <View style={styles.balanceIcon}>
              <MaterialCommunityIcons name="wallet" size={32} color="#F97316" />
            </View>
          </View>
        </View>

        {/* Formulario de canje */}
        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>¿Cuánto quieres canjear?</Text>

            {/* Input de monto */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto en BeCoins</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={[
                    styles.amountInput,
                    !isAmountValid && amount ? styles.inputError : {},
                  ]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={8}
                />
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>BeCoins</Text>
                </View>
              </View>

              {!isAmountValid && amount !== "" && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={16}
                    color="#EF4444"
                  />
                  <Text style={styles.errorText}>
                    Monto inválido o insuficiente
                  </Text>
                </View>
              )}
            </View>

            {/* Sección Recibirás */}
            <View style={styles.receiveSection}>
              <Text style={styles.inputLabel}>Recibirás</Text>
              <View style={styles.receiveResult}>
                <Text style={styles.receiveAmount}>
                  {amount && isAmountValid
                    ? `${formatUSDPrice(convertBeCoinsToUSD(Number(amount)))}`
                    : "0.00"}
                </Text>
                <Text style={styles.receiveCurrency}>USD</Text>
              </View>
            </View>

            {/* Selección de método de retiro */}
            <View style={styles.withdrawMethodSection}>
              <Text style={styles.inputLabel}>
                ¿Dónde querés recibir tu dinero?
              </Text>

              {withdrawMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodOption,
                    selectedWithdrawMethod === method.id &&
                      styles.methodOptionSelected,
                  ]}
                  onPress={() =>
                    setSelectedWithdrawMethod(method.id as "payphone" | "bank")
                  }
                >
                  <View style={styles.methodIcon}>
                    <Text style={styles.methodIconText}>{method.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.methodTitle,
                      selectedWithdrawMethod === method.id &&
                        styles.methodTitleSelected,
                    ]}
                  >
                    {method.title}
                  </Text>
                  <View
                    style={[
                      styles.methodRadio,
                      selectedWithdrawMethod === method.id &&
                        styles.methodRadioSelected,
                    ]}
                  >
                    {selectedWithdrawMethod === method.id && (
                      <View style={styles.methodRadioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botón de retiro */}
            <TouchableOpacity
              style={[
                styles.exchangeButton,
                (!canContinue || isLoading) && styles.exchangeButtonDisabled,
              ]}
              onPress={handleBuy}
              disabled={!canContinue || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <MaterialCommunityIcons
                    name="loading"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.exchangeButtonText}>Procesando...</Text>
                </View>
              ) : (
                <Text style={styles.exchangeButtonText}>Retirar dinero</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="#6B7280"
              />
              <Text style={styles.infoTitle}>Información del canje</Text>
            </View>
            <Text style={styles.infoText}>
              • El canje se realiza al tipo de cambio actual{"\n"}• Los fondos
              estarán disponibles inmediatamente{"\n"}• No se aplican comisiones
              adicionales{"\n"}• Monto mínimo: 1 BeCoin
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de éxito */}
      {showSuccess && successData && (
        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.successModalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={60}
                  color="#6BA43A"
                />
              </View>

              <Text style={styles.successTitle}>¡Canje exitoso!</Text>
              <Text style={styles.successDescription}>
                Has canjeado {successData.amount} BeCoins por{" "}
                <Text style={styles.successAmount}>{successData.usdValue}</Text>
              </Text>

              <View style={styles.successDetails}>
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Operación:</Text>
                  <Text style={styles.successDetailValue}>
                    {successData.opNumber}
                  </Text>
                </View>
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Fecha:</Text>
                  <Text style={styles.successDetailValue}>
                    {successData.date}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setShowSuccess(false);
                  setSuccessData(null);
                  navigation.goBack();
                }}
              >
                <Text style={styles.successButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 16 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F97316",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll container
  scrollContainer: {
    flex: 1,
  },

  // Balance section
  balanceSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  balanceEstimate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  balanceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  // Form section
  formSection: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 24,
    textAlign: "center",
  },

  // Input group
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amountInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#FAFAFA",
    color: "#1E293B",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  currencyBadge: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  currencyBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F97316",
  },

  // Error container
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },

  // Receive section
  receiveSection: {
    marginBottom: 24,
  },
  receiveResult: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  receiveAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F97316",
  },
  receiveCurrency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
  },

  // Withdraw method section
  withdrawMethodSection: {
    marginBottom: 24,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  methodOptionSelected: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  methodIconText: {
    fontSize: 20,
  },
  methodTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  methodTitleSelected: {
    color: "#F97316",
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  methodRadioSelected: {
    borderColor: "#F97316",
  },
  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
  },

  // Conversion section
  conversionSection: {
    marginBottom: 24,
  },
  conversionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F88D2A",
    gap: 4,
  },
  currencySelectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F88D2A",
  },
  conversionResult: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
    gap: 8,
  },
  conversionAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F88D2A",
  },
  conversionCurrency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
  },
  conversionNote: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },

  // Exchange button
  exchangeButton: {
    height: 56,
    backgroundColor: "#F97316",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exchangeButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  exchangeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Info section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },

  // Modal overlay and content
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },

  // Currency options
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  currencyOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  currencyOptionContent: {
    flex: 1,
  },
  currencyOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  currencyOptionTextSelected: {
    color: "#F88D2A",
  },
  currencyOptionCode: {
    fontSize: 14,
    color: "#64748B",
  },

  // Success modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  successDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  successAmount: {
    color: "#6BA43A",
    fontWeight: "700",
  },
  successDetails: {
    width: "100%",
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  successDetailLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  successDetailValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  successButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#F88D2A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Legacy styles (mantener por compatibilidad)
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    flex: 1,
  },
  balanceCardContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
  },
  currencyLabel: {
    backgroundColor: "#FED7AA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#F88D2A",
    minWidth: 120,
  },
  currencyLabelText: {
    fontSize: 16,
    color: "#F88D2A",
    fontWeight: "bold",
    textAlign: "center",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F88D2A",
    marginBottom: 4,
  },
  resultDescription: {
    color: "#6B7280",
    fontSize: 14,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 17,
    color: "#1F2937",
  },
  modalOptionSubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
export default CanjearScreen;
