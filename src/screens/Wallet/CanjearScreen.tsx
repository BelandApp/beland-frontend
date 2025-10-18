import React, { useState, useEffect, useRef } from "react";
import { Modal, FlatList } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../hooks/AuthContext";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { convertBeCoinsToUSD, formatUSDPrice } from "../../constants/currency";
import {
  withdrawService,
  WithdrawAccount,
} from "../../services/withdrawService";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { useWalletData } from "./hooks/useWalletData";

const CanjearScreen: React.FC<{
  navigation: any;
  route?: any;
  balance?: number;
}> = ({ navigation, route, balance: propBalance }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] =
    useState<WithdrawAccount | null>(null);
  const [withdrawAccounts, setWithdrawAccounts] = useState<WithdrawAccount[]>(
    []
  );
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  // Estados para CustomAlert
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Ref para evitar múltiples alerts
  const isShowingAlert = useRef(false);

  const balance =
    useBeCoinsStore((state: { balance: number }) => state.balance) ?? 0;
  const lockedBalance =
    useBeCoinsStore(
      (state: { locked_balance: number }) => state.locked_balance
    ) ?? 0;
  const spendBeCoins = useBeCoinsStore((state: any) => state.spendBeCoins);
  const { refetch } = useWalletData();

  // Cargar cuentas de retiro al montar el componente
  useEffect(() => {
    loadWithdrawAccounts();
  }, []);

  const loadWithdrawAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await withdrawService.getWithdrawAccounts();
      const activeAccounts = response.accounts.filter(
        (account) => account.is_active
      );
      setWithdrawAccounts(activeAccounts);

      // Si solo hay una cuenta activa, seleccionarla automáticamente
      if (activeAccounts.length === 1) {
        setSelectedWithdrawAccount(activeAccounts[0]);
      }
    } catch (error) {
      console.error("Error cargando cuentas de retiro:", error);
      setErrorMessage(
        "No se pudieron cargar las cuentas de retiro. Verifica tu conexión e intenta nuevamente."
      );
      setShowErrorAlert(true);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const isAmountValid = parsedAmount > 0 && parsedAmount <= balance;
  const canContinue =
    isAmountValid && selectedWithdrawAccount && !loadingAccounts;

  const handleBuy = async () => {
    if (!isAmountValid) {
      setErrorMessage(
        "Por favor ingresa un monto válido dentro de tu saldo disponible."
      );
      setShowErrorAlert(true);
      return;
    }

    if (!selectedWithdrawAccount) {
      setErrorMessage(
        "Por favor selecciona una cuenta donde recibir tu dinero."
      );
      setShowErrorAlert(true);
      return;
    }

    if (!user?.id) {
      setErrorMessage("Usuario no autenticado");
      setShowErrorAlert(true);
      return;
    }

    // Mostrar confirmación
    setShowConfirmAlert(true);
  };

  const confirmWithdraw = async () => {
    try {
      setShowConfirmAlert(false);
      setIsLoading(true);

      // Solicitar el retiro
      const withdrawRequest = {
        amountBecoin: parsedAmount,
        withdraw_account_id: selectedWithdrawAccount!.id,
      };

      console.log("💰 Solicitando retiro:", withdrawRequest);
      const response = await withdrawService.requestWithdraw(withdrawRequest);

      if (response) {
        // Actualizar balance local
        spendBeCoins(parsedAmount);

        // Registrar transacción local (nota: implementar si se requiere registro local)

        // Refrescar datos del wallet
        if (refetch) {
          refetch();
        }

        // Mostrar éxito
        setSuccessMessage(
          `¡Retiro exitoso! Se han transferido ${formatUSDPrice(
            convertBeCoinsToUSD(parsedAmount)
          )} USD a tu cuenta ${getAccountNameForConfirmation(
            selectedWithdrawAccount!
          )}.`
        );
        setShowSuccessAlert(true);

        // Limpiar formulario
        setAmount("");
        setSelectedWithdrawAccount(null);
      }
    } catch (error: any) {
      console.error("Error en el retiro:", error);
      let errorMessage = "Ocurrió un error inesperado. Intenta nuevamente.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setErrorMessage(errorMessage);
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountDisplayName = (account: WithdrawAccount) => {
    if (account.withdraw_account_type?.code === "WALLET") {
      const provider = account.provider || "Billetera virtual";
      const phone = account.phone || "N/A";
      return `${provider} - Tel: ${phone}`;
    } else if (account.withdraw_account_type?.code === "BANK") {
      if (account.cbu) {
        return `Cuenta bancaria - CBU: ***${account.cbu.slice(-4)}`;
      } else if (account.alias) {
        return `Cuenta bancaria - Alias: ${account.alias}`;
      } else {
        return "Cuenta bancaria";
      }
    }
    return account.alias || account.owner_name || "Cuenta";
  };

  const getAccountTitle = (account: WithdrawAccount) => {
    if (account.alias) {
      return account.alias;
    }
    if (account.withdraw_account_type?.code === "WALLET" && account.provider) {
      return `${account.provider} - ${account.owner_name}`;
    }
    return account.owner_name || "Cuenta";
  };

  const getAccountNameForConfirmation = (account: WithdrawAccount) => {
    if (account.alias) {
      return account.alias;
    }
    if (account.cbu) {
      return `CBU ***${account.cbu.slice(-4)}`;
    }
    if (account.provider && account.phone) {
      return `${account.provider} (${account.phone})`;
    }
    if (account.provider) {
      return account.provider;
    }
    return account.owner_name || "tu cuenta";
  };

  // Función para validar que solo se ingresen números
  const handleAmountChange = (text: string) => {
    // Permitir solo números, un punto decimal y texto vacío
    const numericRegex = /^[0-9]*\.?[0-9]*$/;

    // Si el texto está vacío, permitirlo
    if (text === "") {
      setAmount(text);
      return;
    }

    // Si el texto cumple con el patrón numérico
    if (numericRegex.test(text)) {
      // Evitar múltiples puntos decimales
      const dotCount = (text.match(/\./g) || []).length;
      if (dotCount <= 1) {
        // No permitir que empiece con punto
        if (!text.startsWith(".")) {
          // Limitar a 2 decimales después del punto
          const parts = text.split(".");
          if (parts.length === 1 || parts[1].length <= 2) {
            // No permitir números que empiecen con múltiples ceros (excepto 0.xx)
            if (!text.match(/^0[0-9]/)) {
              setAmount(text);
            }
          }
        }
      }
    }
  };

  // UI del componente
  if (loadingAccounts) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Cargando cuentas...</Text>
        </View>
      </View>
    );
  }

  if (withdrawAccounts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="bank-off"
            size={64}
            color="#9CA3AF"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No tienes cuentas de retiro</Text>
          <Text style={styles.emptySubtitle}>
            Para canjear tus BeCoins por dinero real, primero necesitas agregar
            una cuenta bancaria o método de pago.
          </Text>
          <TouchableOpacity
            style={styles.addAccountButton}
            onPress={() => navigation.navigate("WalletScreen")}
          >
            <Text style={styles.addAccountButtonText}>Agregar cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Canjear BeCoins</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>
            {balance.toLocaleString()} BeCoins
          </Text>
          {lockedBalance > 0 && (
            <View style={styles.lockedBalanceContainer}>
              <Text style={styles.lockedBalanceLabel}>Balance bloqueado</Text>
              <Text style={styles.lockedBalanceAmount}>
                {lockedBalance.toLocaleString()} BeCoins
              </Text>
            </View>
          )}
          <Text style={styles.balanceUSD}>
            ≈ ${formatUSDPrice(convertBeCoinsToUSD(balance))} USD
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Cantidad a canjear</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.amountInput,
                !isAmountValid && amount !== "" && styles.inputError,
              ]}
              placeholder="0"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              maxLength={10}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Text style={styles.currencyLabel}>BeCoins</Text>
          </View>

          {!isAmountValid && amount !== "" && (
            <Text style={styles.errorText}>
              {parsedAmount > balance
                ? "No tienes suficientes BeCoins"
                : "Ingresa un monto válido"}
            </Text>
          )}

          {amount && isAmountValid && (
            <Text style={styles.conversionText}>
              ≈ ${formatUSDPrice(convertBeCoinsToUSD(parsedAmount))} USD
            </Text>
          )}
        </View>

        {/* Preset Amounts */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>Montos rápidos</Text>
          <View style={styles.presetsContainer}>
            {[100, 200, 500, 1000, balance].map(
              (preset, index) =>
                preset > 0 && (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.presetButton,
                      parsedAmount === preset && styles.presetButtonSelected,
                    ]}
                    onPress={() => setAmount(preset.toString())}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        parsedAmount === preset &&
                          styles.presetButtonTextSelected,
                      ]}
                    >
                      {preset === balance ? "Todo" : preset.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )
            )}
          </View>
        </View>

        {/* Account Selection */}
        <View style={styles.accountSection}>
          <Text style={styles.accountLabel}>Cuenta de destino</Text>

          {selectedWithdrawAccount ? (
            <TouchableOpacity
              style={styles.selectedAccountContainer}
              onPress={() => setShowAccountSelector(true)}
            >
              <View style={styles.accountInfo}>
                <View style={styles.accountTypeContainer}>
                  <Text style={styles.accountType}>
                    {selectedWithdrawAccount.withdraw_account_type?.name || ""}
                  </Text>
                </View>
                <Text style={styles.accountName}>
                  {getAccountTitle(selectedWithdrawAccount)}
                </Text>
                <Text style={styles.accountDetails}>
                  {getAccountDisplayName(selectedWithdrawAccount)}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={24} color="#6B7280" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.selectAccountContainer}
              onPress={() => setShowAccountSelector(true)}
            >
              <MaterialCommunityIcons
                name="bank-plus"
                size={32}
                color="#9CA3AF"
              />
              <Text style={styles.selectAccountText}>Seleccionar cuenta</Text>
              <Text style={styles.selectAccountSubtext}>
                Elige dónde recibir tu dinero
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Continue Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
            ]}
            onPress={handleBuy}
            disabled={!canContinue || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>
                Canjear {amount ? `${amount} BeCoins` : ""}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Account Selector Modal */}
      <Modal
        visible={showAccountSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar cuenta</Text>
              <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={withdrawAccounts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.accountOption,
                    selectedWithdrawAccount?.id === item.id &&
                      styles.accountOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedWithdrawAccount(item);
                    setShowAccountSelector(false);
                  }}
                >
                  <View style={styles.accountOptionInfo}>
                    <Text style={styles.accountOptionName}>
                      {getAccountTitle(item)}
                    </Text>
                    <Text style={styles.accountOptionDetails}>
                      {getAccountDisplayName(item)}
                    </Text>
                    <Text style={styles.accountOptionType}>
                      {item.withdraw_account_type?.name || ""}
                    </Text>
                  </View>
                  {selectedWithdrawAccount?.id === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* CustomAlert para errores */}
      <CustomAlert
        visible={showErrorAlert}
        type="error"
        title="Error"
        message={errorMessage}
        onClose={() => setShowErrorAlert(false)}
      />

      {/* CustomAlert para éxito */}
      <CustomAlert
        visible={showSuccessAlert}
        type="success"
        title="¡Retiro exitoso!"
        message={successMessage}
        onClose={() => {
          setShowSuccessAlert(false);
          // Navegar de vuelta al wallet después del éxito
          navigation.goBack();
        }}
      />

      {/* CustomAlert para confirmación */}
      <CustomAlert
        visible={showConfirmAlert}
        type="info"
        title="Confirmar retiro"
        message={
          selectedWithdrawAccount
            ? `¿Estás seguro de que quieres retirar ${formatUSDPrice(
                convertBeCoinsToUSD(parsedAmount)
              )} USD (${parsedAmount} BeCoins) a tu cuenta ${getAccountNameForConfirmation(
                selectedWithdrawAccount
              )}?`
            : "¿Confirmas esta operación?"
        }
        primaryButton={{
          text: "Confirmar",
          onPress: confirmWithdraw,
        }}
        secondaryButton={{
          text: "Cancelar",
          onPress: () => setShowConfirmAlert(false),
        }}
        onClose={() => setShowConfirmAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  addAccountButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addAccountButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  balanceSection: {
    margin: 16,
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  balanceUSD: {
    fontSize: 16,
    color: "#6B7280",
  },
  lockedBalanceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
    width: "100%",
  },
  lockedBalanceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  lockedBalanceAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  inputSection: {
    margin: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    paddingVertical: 16,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 8,
  },
  conversionText: {
    fontSize: 14,
    color: "#10B981",
    marginTop: 8,
    fontWeight: "500",
  },
  presetsSection: {
    margin: 16,
  },
  presetsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  presetButtonSelected: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  presetButtonTextSelected: {
    color: "#FFFFFF",
  },
  accountSection: {
    margin: 16,
  },
  accountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  selectedAccountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 2,
    borderColor: "#10B981",
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
  },
  selectAccountContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  accountInfo: {
    flex: 1,
  },
  accountTypeContainer: {
    marginBottom: 4,
  },
  accountType: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  accountDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectAccountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  selectAccountSubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  actionSection: {
    padding: 16,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  continueButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  accountOptionSelected: {
    backgroundColor: "#F0FDF4",
  },
  accountOptionInfo: {
    flex: 1,
  },
  accountOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  accountOptionDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  accountOptionType: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
});

export default CanjearScreen;
