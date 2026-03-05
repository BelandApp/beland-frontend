import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  TextInput,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "src/context";
import { useWallet } from "../Wallet/hooks/useWalletData";
import { WalletService } from "@services/core";
import { useNotify } from "src/hooks";
import { getBackendErrorMessage } from "src/services";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useBeCoinsPrice } from "src/hooks";
import { ThemedHeader } from "src/components/shared/headers/Header";

const ReceiveScreen = () => {
  const { navigate } = useCustomNavigation();
  const { walletData, wallet, refreshAll } = useWallet();
  const { user } = useAuth();
  const { beCoinsToUsd } = useBeCoinsPrice();

  const [showToast, setShowToast] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [aliasLoadingDots, setAliasLoadingDots] = useState(0);
  const [editingAlias, setEditingAlias] = useState(false);
  const [aliasInput, setAliasInput] = useState("");
  const [savingAlias, setSavingAlias] = useState(false);
  const notify = useNotify();

  // Usar alias del backend (siempre en mayúsculas)
  const alias = walletData?.alias?.toUpperCase();

  // Calcular saldo en USD
  const balanceUsd = useMemo(() => {
    return beCoinsToUsd(walletData.balance || 0);
  }, [walletData.balance, beCoinsToUsd]);

  // Animación de puntos de carga
  useEffect(() => {
    if (!alias) {
      const interval = setInterval(() => {
        setAliasLoadingDots((prev) => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setAliasLoadingDots(0);
    }
  }, [alias]);

  useEffect(() => {
    if (!editingAlias) return;
    setAliasInput(wallet?.alias ?? "");
  }, [editingAlias, wallet?.alias]);

  // Obtener QR del backend
  useEffect(() => {
    const fetchQr = async () => {
      if (user?.id) {
        setQrLoading(true);
        setQrError(null);
        try {
          const qrResponse = await WalletService.getWalletQR();
          if (qrResponse?.qr) {
            setQrImage(qrResponse.qr);
          } else {
            setQrError("No se pudo obtener el QR");
          }
        } catch (err) {
          setQrError("Error al obtener el QR");
        } finally {
          setQrLoading(false);
        }
      }
    };
    fetchQr();
  }, [user?.id]);

  const handleCopy = async () => {
    if (alias) {
      await Clipboard.setStringAsync(alias);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      const userName =
        user?.full_name || user?.email?.split("@")[0] || "Usuario";
      await Share.share({
        message: `Hola! Puedes enviarme dinero en Beland, sin importar tu institución bancaria y sin comisiones. Ingresa a LINK, a la opción enviar dinero y usa mi ALIAS: ${alias}
Gracias! Un abrazo, ${userName} ♻️🌎 
 https://beland.app/send/${alias}`,
        title: "Mi alias de Beland",
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  const openEditAlias = () => {
    setAliasInput(wallet?.alias ?? "");
    setEditingAlias(true);
  };

  const handleSaveAlias = async () => {
    if (!wallet || !wallet.id) return;
    const newAlias = (aliasInput || "").toUpperCase().trim();
    if (!newAlias || newAlias.length < 2) {
      notify.error({ message: "El alias debe tener al menos 2 caracteres." });
      return;
    }

    try {
      setSavingAlias(true);
      await WalletService.updateWallet(wallet.id, { alias: newAlias });
      notify.success({ message: "Alias actualizado correctamente." });
      setEditingAlias(false);
      refreshAll();
    } catch (err: any) {
      const message =
        getBackendErrorMessage(err) || "No se pudo actualizar el alias.";
      notify.error({ message });
    } finally {
      setSavingAlias(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedHeader
        title="Recibir Dinero"
        onBackPress={() => navigate("MainTabs", { screen: "Wallet" })}
        canGoBack
      />

      {/* Card de Alias Principal */}
      <View style={styles.aliasMainCard}>
        <View style={styles.aliasHeader}>
          <MaterialCommunityIcons name="at" size={24} color="#7DA244" />
          <Text style={styles.aliasTitle}>Tu Alias</Text>
        </View>

        <View style={styles.aliasDisplay}>
          {/* Caja editable: al hacer click entra en modo edición */}
          {!editingAlias ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={openEditAlias}
              style={styles.aliasBoxTouchable}
            >
              <Text style={styles.aliasValue}>
                {alias !== null
                  ? alias || `Cargando${".".repeat(aliasLoadingDots)}`
                  : "Crea tu alias"}
              </Text>
              <View style={styles.pencilCircle}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={16}
                  color="#7DA244"
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View>
              <TextInput
                value={aliasInput}
                onChangeText={(t) => setAliasInput((t || "").toUpperCase())}
                style={styles.aliasEditInput}
                placeholder="Tu alias"
                autoCapitalize="characters"
                maxLength={32}
              />

              <View style={styles.inlineEditActions}>
                <TouchableOpacity
                  style={[styles.inlineBtn, { backgroundColor: "#e5e7eb" }]}
                  onPress={() => setEditingAlias(false)}
                  disabled={savingAlias}
                >
                  <Text style={[styles.inlineBtnText, { color: "#111827" }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.inlineBtn, { backgroundColor: "#7DA244" }]}
                  onPress={handleSaveAlias}
                  disabled={savingAlias}
                >
                  {savingAlias ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.inlineBtnText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.aliasDescription}>
          Haz click para editar tu alias
        </Text>

        <View style={styles.bigActionsRow}>
          <TouchableOpacity
            style={[styles.bigActionButton, !alias && { opacity: 0.6 }]}
            onPress={handleCopy}
            disabled={!alias}
          >
            <MaterialCommunityIcons
              name="content-copy"
              size={18}
              color="#7DA244"
            />
            <Text style={styles.bigActionButtonText}>Copiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bigActionButton, !alias && { opacity: 0.6 }]}
            onPress={handleShare}
            disabled={!alias}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={18}
              color="#7DA244"
            />
            <Text style={styles.bigActionButtonText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Información de Saldo */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Saldo en USD</Text>
            <Text style={styles.balanceUsd}>${balanceUsd.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Saldo en BeCoins</Text>
            <Text style={styles.balanceBecoins}>
              {Math.floor(walletData.balance || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* QR Code (solo para comercios) */}
      {user?.role_name === "COMMERCE" && (
        <View style={styles.qrSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="qrcode" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Código QR</Text>
          </View>

          <View style={styles.qrCard}>
            <View style={styles.qrContainer}>
              {qrLoading ? (
                <View style={styles.qrLoading}>
                  <ActivityIndicator size="large" color="#7DA244" />
                  <Text style={styles.qrLoadingText}>Generando QR...</Text>
                </View>
              ) : qrImage ? (
                <Image
                  source={{ uri: qrImage }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.qrError}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={48}
                    color="#f59e0b"
                  />
                  <Text style={styles.qrErrorText}>
                    {qrError || "No se pudo cargar el QR"}
                  </Text>
                </View>
              )}
            </View>

            {qrImage && (
              <>
                <Text style={styles.qrDescription}>
                  Escanea este código para recibir pagos
                </Text>

                {Platform.OS === "web" ? (
                  <a
                    href={qrImage}
                    download={`qr-beland-${Date.now()}.png`}
                    style={{
                      backgroundColor: "#7DA244",
                      padding: 12,
                      borderRadius: 10,
                      marginTop: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontFamily: "sans-serif",
                      width: "100%",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="download"
                      size={20}
                      color="#fff"
                    />
                    <span
                      style={{
                        color: "#fff",
                        marginLeft: 8,
                        fontWeight: "600",
                      }}
                    >
                      Descargar QR
                    </span>
                  </a>
                ) : (
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={async () => {
                      if (!qrImage) return;
                      try {
                        const FileSystem = require("expo-file-system");
                        const filename = `qr-beland-${Date.now()}.png`;
                        const downloadResumable = FileSystem.downloadAsync(
                          qrImage,
                          FileSystem.documentDirectory + filename,
                        );
                        await downloadResumable;
                        alert("QR guardado en tus archivos");
                      } catch (err) {
                        alert("Error al descargar el QR");
                      }
                    }}
                  >
                    <MaterialCommunityIcons
                      name="download"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.downloadButtonText}>Descargar QR</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* Información Importante */}
      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={20} color="#3b82f6" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Información Importante</Text>
          <Text style={styles.infoText}>
            • Las transferencias se manejan en dólares (USD){"\n"}• Los alias
            solo se escriben en MAYÚSCULAS{"\n"}• Las transferencias son
            instantáneas
          </Text>
        </View>
      </View>

      {/* Inline edit area: cuando editingAlias es true mostramos input dentro de la tarjeta */}

      {/* Toast de copiado */}
      {showToast && (
        <View style={styles.toast}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
          <Text style={styles.toastText}>¡Alias copiado al portapapeles!</Text>
        </View>
      )}
    </ScrollView>
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
    backgroundColor: "#7DA244",
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
  aliasMainCard: {
    margin: 16,
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  aliasHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aliasTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  aliasDisplay: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#7DA244",
    borderStyle: "dashed",
  },
  aliasValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#7DA244",
    textAlign: "center",
    letterSpacing: 2,
  },
  aliasDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  aliasActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7DA244",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#7DA244",
  },
  balanceCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  balanceUsd: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  balanceBecoins: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7DA244",
  },
  qrSection: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  qrContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    minHeight: 220,
    justifyContent: "center",
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  qrLoading: {
    alignItems: "center",
  },
  qrLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  qrError: {
    alignItems: "center",
  },
  qrErrorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#f59e0b",
    textAlign: "center",
  },
  qrDescription: {
    marginTop: 16,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7DA244",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  downloadButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  infoCard: {
    flexDirection: "row",
    margin: 16,
    marginTop: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 20,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  aliasBoxTouchable: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  pencilCircle: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6f4e6",
  },
  aliasEditInput: {
    borderWidth: 0,
    fontSize: 28,
    fontWeight: "700",
    color: "#7DA244",
    textAlign: "center",
    paddingVertical: 8,
  },
  inlineEditActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  inlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  inlineBtnText: {
    fontWeight: "700",
    color: "#fff",
  },
  bigActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  bigActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#7DA244",
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  bigActionButtonText: {
    marginLeft: 8,
    color: "#7DA244",
    fontWeight: "700",
  },
});

export default ReceiveScreen;
