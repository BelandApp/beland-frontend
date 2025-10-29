import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatUSDPrice } from "../../constants/currency";
import {
  WithdrawService,
  WithdrawAccountType,
} from "../../services/withdrawService";

interface WithdrawMethodScreenProps {
  navigation: any;
  route: {
    params: {
      beCoinsAmount: number;
      usdAmount: number;
    };
  };
}

const WithdrawMethodScreen: React.FC<WithdrawMethodScreenProps> = ({
  navigation,
  route,
}) => {
  const { beCoinsAmount, usdAmount } = route.params;
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [accountTypes, setAccountTypes] = useState<WithdrawAccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available account types from backend
  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        setLoading(true);
        const response = await WithdrawService.getWithdrawAccountTypes();
        console.log("Account types response:", response);

        // Handle both direct array and paginated response
        const types = Array.isArray(response)
          ? response
          : Array.isArray(response[0])
          ? response[0]
          : [];

        setAccountTypes(types);
      } catch (err) {
        console.error("Error fetching account types:", err);
        setError("No se pudieron cargar los tipos de cuenta");
        // Fallback to default options
        setAccountTypes([
          {
            id: "fallback-bank",
            code: "BANK",
            name: "Cuenta Bancaria",
            description: "Cuenta bancaria tradicional",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "fallback-wallet",
            code: "WALLET",
            name: "Billetera Virtual",
            description: "MercadoPago, Payphone, etc.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountTypes();
  }, []);

  // Map account types to display format
  const withdrawMethods = accountTypes.map((type) => ({
    id: type.id,
    code: type.code,
    title: type.name,
    description: type.description,
    icon: getIconForAccountType(type.code),
    available: true,
  }));

  function getIconForAccountType(code: string): string {
    switch (code.toUpperCase()) {
      case "BANK":
        return "🏦";
      case "WALLET":
        return "💳";
      case "MERCADOPAGO":
        return "💙";
      case "PAYPHONE":
        return "📱";
      default:
        return "💰";
    }
  }

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert(
        "Selecciona un método",
        "Por favor selecciona un método de retiro"
      );
      return;
    }

    const selectedType = accountTypes.find(
      (type) => type.id === selectedMethod
    );
    if (!selectedType) {
      Alert.alert("Error", "Tipo de cuenta no válido");
      return;
    }

    // Navigate to specific form based on account type
    switch (selectedType.code.toUpperCase()) {
      case "BANK":
        navigation.navigate("CreateBankAccount", {
          beCoinsAmount,
          usdAmount,
          accountTypeId: selectedType.id,
          accountTypeName: selectedType.name,
        });
        break;
      case "WALLET":
        navigation.navigate("CreateWalletAccount", {
          beCoinsAmount,
          usdAmount,
          accountTypeId: selectedType.id,
          accountTypeName: selectedType.name,
        });
        break;
      default:
        Alert.alert(
          "Funcionalidad en desarrollo",
          `Pronto podrás retirar dinero a tu ${selectedType.name.toLowerCase()}`
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retirar dinero</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F88D2A" />
            <Text style={styles.loadingText}>
              Cargando opciones de retiro...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                // Re-fetch data
              }}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Resumen del canje */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryQuestion}>
                ¿Cuántas BeCoins querés cambiar?
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryAmountContainer}>
                  <Text style={styles.summaryAmount}>{beCoinsAmount}</Text>
                </View>
                <Text style={styles.summaryLabel}>BeCoins</Text>
              </View>
            </View>

            {/* Recibirás */}
            <View style={styles.receiveCard}>
              <Text style={styles.receiveLabel}>Recibirás</Text>
              <View style={styles.receiveRow}>
                <View style={styles.receiveAmountContainer}>
                  <Text style={styles.receiveAmount}>
                    {formatUSDPrice(usdAmount)}
                  </Text>
                </View>
                <Text style={styles.receiveLabel}>Pesos</Text>
              </View>
            </View>

            {/* Selección de método */}
            <View style={styles.methodCard}>
              <Text style={styles.methodQuestion}>
                ¿Dónde querés recibir tu dinero?
              </Text>

              {withdrawMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodOption,
                    selectedMethod === method.id && styles.methodOptionSelected,
                  ]}
                  onPress={() => handleMethodSelect(method.id)}
                >
                  <View style={styles.methodIcon}>
                    <Text style={styles.methodIconText}>{method.icon}</Text>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text
                      style={[
                        styles.methodTitle,
                        selectedMethod === method.id &&
                          styles.methodTitleSelected,
                      ]}
                    >
                      {method.title}
                    </Text>
                    {method.description && (
                      <Text style={styles.methodDescription}>
                        {method.description}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.methodRadio,
                      selectedMethod === method.id &&
                        styles.methodRadioSelected,
                    ]}
                  >
                    {selectedMethod === method.id && (
                      <View style={styles.methodRadioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botón continuar */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedMethod && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!selectedMethod}
            >
              <Text style={styles.continueButtonText}>Retirar dinero</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 16 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F88D2A",
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  summaryAmountContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F88D2A",
  },
  receiveCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  receiveLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  receiveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  receiveAmountContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  receiveAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  methodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  methodQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
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
    borderColor: "#F88D2A",
    backgroundColor: "#FFF7ED",
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F88D2A",
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
    color: "#F88D2A",
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
    borderColor: "#F88D2A",
  },
  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F88D2A",
  },
  continueButton: {
    backgroundColor: "#F88D2A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  methodInfo: {
    flex: 1,
    marginRight: 12,
  },
  methodDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
});

export default WithdrawMethodScreen;
