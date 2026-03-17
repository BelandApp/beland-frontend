import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { WalletService } from "@services/core";
import Constants from "expo-constants";
import { useWallet } from "../Wallet/hooks/useWalletData";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useNotify, useBeCoinsPrice, useRecentRecipients } from "src/hooks";
import { getBackendErrorMessage } from "src/services";
import RecentRecipients from "./components/RecentRecipients";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { CustomLoader } from "src/components";
import { storage } from "src/stores";
import { DeepLinkService } from "src/services/deepLink/deepLink.service";

type Tab = "amount" | "contacts";

const SendScreen = ({ route }: { route: any }) => {
  const id = route.params?.id;
  const { navigate } = useCustomNavigation();
  const { user, handleAuth0Login, isAuthenticated } = useAuth();
  const notify = useNotify();

  const { walletData, refreshAll } = useWallet();
  const { pricePerBeCoin, usdToBeCoins, beCoinsToUsd } = useBeCoinsPrice();
  const {
    recipients,
    loading: loadingRecipients,
    refetch: refetchRecipients,
  } = useRecentRecipients();

  // Estados principales
  const [activeTab, setActiveTab] = useState<Tab>("amount");
  const [amountUsd, setAmountUsd] = useState("");
  const [address, setAddress] = useState(id ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientAliases, setRecipientAliases] = useState<
    Record<string, string>
  >({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Verificar modo demo
  const useDemoMode = Constants.expoConfig?.extra?.useDemoMode === "true";

  // Calcular equivalente en BeCoins
  const beCoinsAmount = useMemo(() => {
    const usd = parseFloat(amountUsd);
    if (isNaN(usd) || usd <= 0) return 0;
    return usdToBeCoins(usd);
  }, [amountUsd, usdToBeCoins]);

  React.useEffect(() => {
    let mounted = true;
    if (!recipients || recipients.length === 0) {
      setRecipientAliases({});
      return;
    }

    const work = async () => {
      const map: Record<string, string> = {};
      await Promise.allSettled(
        recipients.map(async (r: any) => {
          if (!r?.wallet_id) return;
          try {
            const wallet = await WalletService.getWalletById(r.wallet_id);
            const alias = wallet && (wallet.alias || (wallet as any).address);
            if (alias) map[r.wallet_id] = alias;
          } catch (err) {
            // ignore individual fetch errors
          }
        }),
      );
      if (mounted) setRecipientAliases(map);
    };

    work();
    return () => {
      mounted = false;
    };
  }, [recipients]);

  // Saldo disponible en USD
  const balanceUsd = useMemo(() => {
    return beCoinsToUsd(walletData.balance);
  }, [walletData.balance, beCoinsToUsd]);

  useEffect(() => {
    if (id && !isAuthenticated) {
      notify.confirm({
        message: "Debes estar logueado para realizar transferencias",
        onConfirm: async () => {
          await DeepLinkService.setIntent({ screen: "Send", id });
          navigate("Login");
        },
        onCancel: () => navigate("MainTabs", { screen: "Home" }),
      });
    } else if (!isAuthenticated) {
      navigate("MainTabs", { screen: "Wallet" });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <CustomLoader />;
  }
  // Validar transferencia
  const validateTransfer = (): boolean => {
    const transferAmount = parseFloat(amountUsd);

    if (!amountUsd || isNaN(transferAmount) || transferAmount <= 0) {
      notify.error({ message: "Por favor ingresa un monto válido" });
      return false;
    }

    if (beCoinsAmount > walletData.balance) {
      notify.error({
        message: "Saldo insuficiente para realizar la transferencia",
      });
      return false;
    }

    if (!address.trim()) {
      notify.error({
        message: "Por favor ingresa un alias",
      });
      return false;
    }

    return true;
  };

  // Manejar envío
  const handleSend = async () => {
    if (!validateTransfer()) return;

    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      if (useDemoMode) {
        notify.info({ message: "Estás en modo DEMO" });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        notify.success({
          message: `Se han enviado $${amountUsd} USD (${beCoinsAmount.toFixed(
            2,
          )} BECOINS) a ${address}`,
        });
        refreshAll();
      } else {
        if (!user?.email) {
          notify.confirm({
            message: "Debes iniciar sesión para transferir",
            onConfirm: () => handleAuth0Login(),
          });
          return;
        }

        const recipientIdentifier = address.trim().toUpperCase();

        const transferResult = await WalletService.transferToAlias(
          recipientIdentifier,
          beCoinsAmount,
        );

        if (transferResult) {
          notify.success({
            message: `Transferencia exitosa de $${amountUsd} USD a ${address}`,
          });
          refreshAll();

          // Esperar un momento antes de recargar contactos para dar tiempo a que se registre en la BD
          setTimeout(() => {
            refetchRecipients();
          }, 1500);
        }
      }

      // Limpiar formulario
      setAmountUsd("");
      setAddress("");
    } catch (error) {
      console.error("Error en transferencia:", error);
      const message = getBackendErrorMessage(error);
      notify.error({ message: message || "Error en transferencia" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipient = (recipient: any) => {
    const alias = recipient?.wallet_id
      ? recipientAliases[recipient.wallet_id]
      : undefined;
    if (alias) {
      setAddress(alias.toUpperCase());
      setActiveTab("amount");
    }
  };

  // Montos predefinidos en USD
  const presetAmounts = [1, 2, 5, 10, 20];

  const renderAmountTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Destinatario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Destinatario</Text>
        <View style={styles.recipientContainer}>
          <MaterialCommunityIcons
            name="at"
            size={20}
            color="#9ca3af"
            style={styles.recipientIcon}
          />
          <TextInput
            style={styles.recipientInput}
            placeholder="Alias del destinatario"
            value={address}
            onChangeText={(text) => setAddress(text.toUpperCase())}
            autoCapitalize="characters"
            keyboardType="default"
          />
          {recipientLoading ? (
            <ActivityIndicator size="small" color="#7DA244" />
          ) : (
            address.length > 0 && (
              <TouchableOpacity onPress={() => setAddress("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            )
          )}
        </View>
        <Text style={styles.helperText}>
          Los alias solo se escriben en MAYÚSCULAS
        </Text>
      </View>

      {/* Monto en USD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monto en USD</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            value={amountUsd}
            onChangeText={setAmountUsd}
            keyboardType="decimal-pad"
            maxLength={10}
          />
          <Text style={styles.currencyCode}>USD</Text>
        </View>

        {/* Equivalente en BeCoins */}
        {beCoinsAmount > 0 && (
          <View style={styles.equivalentContainer}>
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={16}
              color="#7DA244"
            />
            <Text style={styles.equivalentText}>
              ≈ {beCoinsAmount.toFixed(2)} BECOINS
            </Text>
          </View>
        )}

        {/* Montos predefinidos */}
        <View style={styles.presetsContainer}>
          {presetAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.presetButton,
                amountUsd === amount.toString() && styles.presetButtonActive,
              ]}
              onPress={() => setAmountUsd(amount.toString())}
            >
              <Text
                style={[
                  styles.presetText,
                  amountUsd === amount.toString() && styles.presetTextActive,
                ]}
              >
                ${amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Información del saldo */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <MaterialCommunityIcons name="wallet" size={20} color="#7DA244" />
          <Text style={styles.balanceTitle}>Saldo disponible</Text>
        </View>
        <View style={styles.balanceAmounts}>
          <Text style={styles.balanceUsd}>${balanceUsd.toFixed(2)} USD</Text>
          <Text style={styles.balanceBecoins}>
            {Math.floor(walletData.balance)} BECOINS
          </Text>
        </View>
      </View>

      {/* Botón enviar */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          { opacity: amountUsd && address && !isLoading ? 1 : 0.5 },
        ]}
        disabled={!amountUsd || !address || isLoading}
        onPress={() => setShowConfirmModal(true)}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
            <Text style={styles.sendButtonText}>ENVIAR TRANSFERENCIA</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContactsTab = () => {
    // Si el usuario no está autenticado, mostrar mensaje
    if (!user?.email) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="account-alert"
            size={48}
            color="#f59e0b"
          />
          <Text style={styles.emptyText}>
            Debes iniciar sesión para ver tus contactos
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleAuth0Login}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <RecentRecipients
        recipients={recipients}
        onSelectRecipient={handleSelectRecipient}
        loading={loadingRecipients}
        onRefresh={refetchRecipients}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ThemedHeader
        title="Enviar Dinero"
        buttons={
          <TouchableOpacity
            onPress={() => navigate("QR")}
            style={styles.qrButton}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
          </TouchableOpacity>
        }
        canGoBack
        onBackPress={() => navigate("MainTabs", { screen: "Wallet" })}
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "amount" && styles.tabActive]}
          onPress={() => setActiveTab("amount")}
        >
          <MaterialCommunityIcons
            name="cash"
            size={20}
            color={activeTab === "amount" ? "#4ecdc4" : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "amount" && styles.tabTextActive,
            ]}
          >
            Monto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "contacts" && styles.tabActive]}
          onPress={() => setActiveTab("contacts")}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={activeTab === "contacts" ? "#4ecdc4" : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "contacts" && styles.tabTextActive,
            ]}
          >
            Contactos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de tabs */}
      {activeTab === "amount" ? renderAmountTab() : renderContactsTab()}

      {/* Modal de confirmación */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons
                name="information"
                size={48}
                color="#4ecdc4"
              />
            </View>
            <Text style={styles.modalTitle}>Confirmar Transferencia</Text>
            <View style={styles.modalDetails}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Destinatario:</Text>
                <Text style={styles.modalValue}>{address}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Monto:</Text>
                <Text style={styles.modalValue}>${amountUsd} USD</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Equivalente:</Text>
                <Text style={styles.modalValue}>
                  {beCoinsAmount.toFixed(2)} BECOINS
                </Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleSend}
              >
                <Text style={styles.modalButtonConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#4ecdc4",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  qrButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#4ecdc4",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  tabTextActive: {
    color: "#4ecdc4",
  },
  tabContent: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  recipientIcon: {
    marginRight: 8,
  },
  recipientInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#4ecdc4",
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4ecdc4",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 8,
  },
  equivalentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  equivalentText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#7DA244",
  },
  presetsContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  presetButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#4ecdc4",
  },
  presetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  presetTextActive: {
    color: "#4ecdc4",
  },
  balanceCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  balanceAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceUsd: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  balanceBecoins: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7DA244",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ecdc4",
    margin: 16,
    padding: 18,
    borderRadius: 12,
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  modalDetails: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  modalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#4ecdc4",
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  loginButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#4ecdc4",
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default SendScreen;
