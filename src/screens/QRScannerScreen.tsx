import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../components/layout/RootStackNavigator";
import { WalletService } from "@services/core";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import { colors } from "../styles/colors";
import { Button } from "../components/ui/Button";
import { GoBackButton } from "src/components/shared/buttons/GoBack.button";

export const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const pendingRedemption = (route.params as any)?.pendingRedemption;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;

    // QR scanned
    setScanned(true);
    setIsActive(false);
    setLoading(true);

    // Navegación automática tras escaneo
    (async () => {
      try {
        // processing scanned wallet_id
        const paymentDataRaw = await WalletService.getDataPayment(data);

        // Sanitizar paymentData para evitar mostrar recursos inválidos que
        // puedan venir de QRs de sistema o usuarios admin.
        const sanitizePaymentData = (pd: any) => {
          const copy: any = { ...(pd || {}) };

          // Normalize amount to string/number where possible
          if (typeof copy.amount === "string") {
            const num = Number(copy.amount);
            if (!isNaN(num)) copy.amount = num.toFixed(2);
          }

          // Filter paymentData.resource: solo entries con id, nombre y descuento válido
          if (Array.isArray(copy.resource)) {
            copy.resource = copy.resource.filter((res: any) => {
              return (
                res &&
                (res.id || res.resource_id) &&
                (res.resource_name || res.name) &&
                typeof (
                  res.resource_discount ??
                  res.discount ??
                  res.discount
                ) !== "undefined" &&
                Number((res.resource_discount ?? res.discount) || 0) > 0 &&
                Number((res.resource_quanity ?? res.quantity) || 0) > 0
              );
            });
          } else {
            copy.resource = [];
          }

          // Filter redemptions: tener id y tipo
          if (Array.isArray(copy.redemptions)) {
            copy.redemptions = copy.redemptions.filter(
              (r: any) => r && r.id && r.type
            );
          } else {
            copy.redemptions = [];
          }

          // Filter user_resources: mantener solo los recursos con discount válido y cantidad disponible
          if (Array.isArray(copy.user_resources)) {
            copy.user_resources = copy.user_resources.filter((ur: any) => {
              const hasResource = ur && ur.resource;
              const discount = Number(
                (ur.resource &&
                  (ur.resource.discount || ur.resource.resource_discount)) ||
                  0
              );
              const qty = Number(
                (ur.quantity ?? ur.quantity_redeemed ?? 0) || 0
              );
              const available =
                Number(ur.quantity ?? 0) - Number(ur.quantity_redeemed ?? 0);
              return hasResource && discount > 0 && available > 0;
            });
          } else {
            copy.user_resources = [];
          }

          return copy;
        };

        const paymentData = sanitizePaymentData(paymentDataRaw);

        // Validación básica: si no hay wallet_id, amount ni amount_to_payment_id,
        // probablemente no sea un QR de pago válido (ej. cuentas admin)
        const hasValidPaymentKeys =
          paymentData &&
          (paymentData.wallet_id ||
            paymentData.amount ||
            paymentData.amount_to_payment_id);
        if (!hasValidPaymentKeys) {
          setLoading(false);
          // Restaurar scanner para permitir re-intento
          setScanned(false);
          setIsActive(true);
          Alert.alert(
            "QR no válido",
            "Los datos recibidos no parecen corresponder a un pago válido."
          );
          return;
        }
        // Log del pendingRedemption que vino al abrir el scanner
        // pendingRedemption (if present) attached from navigation params
        // Si el QR tiene wallet_id y amount, es pago QR
        if (
          paymentData.wallet_id &&
          paymentData.amount &&
          Number(paymentData.amount) > 0
        ) {
          localStorage.setItem("payphone_is_qr_payment", "true");
          localStorage.setItem("payphone_to_wallet_id", paymentData.wallet_id);
        } else {
          localStorage.removeItem("payphone_is_qr_payment");
          localStorage.removeItem("payphone_to_wallet_id");
        }
        // Incluyo amount_to_payment_id en el objeto
        paymentData.amount_to_payment_id =
          paymentData.amount_to_payment_id ?? null;
        // Si abrimos el scanner pasando un recurso pendiente, lo adjuntamos
        if (pendingRedemption) {
          (paymentData as any).appliedRedemption = pendingRedemption;
        }

        // Detectar QRs que parecen ser de administración (heurística) y evitar navegar
        const name = (paymentData.full_name || paymentData.commerce_name || "")
          .toString()
          .toLowerCase();
        const isAdminQr =
          /super.*admin|superadmin|\badmin\b|beland\s*admin/i.test(name);
        if (isAdminQr) {
          setLoading(false);
          // Restaurar scanner para permitir re-intento
          setScanned(false);
          setIsActive(true);
          Alert.alert(
            "QR no válido",
            "El código QR escaneado pertenece a una cuenta administrativa y no corresponde a una máquina de cobro."
          );
          // No navegar al payment screen para evitar estados extraños
          return;
        }
        setLoading(false);
        navigation.navigate("PaymentScreen", { paymentData } as any);
      } catch (err: any) {
        setLoading(false);
        // Restaurar scanner para permitir re-intento
        setScanned(false);
        setIsActive(true);

        // Intentar extraer status si el apiRequest lanzó un error con detalles
        const status =
          err?.status || err?.statusCode || err?.body?.status || null;
        if (status === 500) {
          Alert.alert(
            "Error del servidor",
            "Ocurrió un error interno al procesar este QR en el servidor. Intenta de nuevo más tarde o contacta soporte."
          );
        } else {
          Alert.alert("Error", "No se pudo obtener los datos de pago");
        }
        console.error("[QRScanner] Error al obtener datos de pago:", err);
      }
    })();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.centerContent}>
          <Text style={styles.message}>Solicitando permisos de cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.centerContent}>
          <Text style={styles.message}>
            Necesitamos acceso a la cámara para escanear códigos QR
          </Text>
          <Button
            title="Solicitar permisos"
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === "granted");
            }}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <GoBackButton/>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear QR</Text>
        <Text style={styles.subtitle}>
          Apunta la cámara hacia el código QR de la máquina de reciclaje
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        {isActive && (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
          />
        )}

        {/* Overlay para mostrar el área de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanText}>
            Coloca el código QR dentro del marco
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={isActive ? "Pausar" : "Reanudar"}
          onPress={() => {
            setIsActive(!isActive);
            if (!isActive) {
              setScanned(false);
            }
          }}
          variant="secondary"
          style={styles.controlButton}
        />
      </View>

      {/* Loader visual cuando está cargando datos de pago */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderCard}>
            <Text style={styles.loaderText}>Procesando pago...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  loaderCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 40,
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
  },
  loaderText: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.belandOrange,
    borderRadius: 20,
    backgroundColor: "rgba(248, 141, 42, 0.1)",
  },
  scanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footer: {
    padding: 20,
  },
  controlButton: {
    alignSelf: "center",
  },
});
