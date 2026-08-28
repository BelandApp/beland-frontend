import React, { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { WalletService } from "@services/core";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, BarcodeScanningResult } from "expo-camera";
import { colors } from "../../styles/colors";
import { Button, ThemedHeader } from "@components/shared";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { sanitizePaymentData } from "./services/sanitizePaymentData";
import { buildPaymentData, isAdminQR } from "./services/validators";
import { useQRStatus } from "./hooks/useQRStatus";
import { useCameraPermission } from "./hooks/useCameraPermissions";
import { LoadingPermissionCamera } from "./components/LoadingPermissionCamera";
import NotPermissionCamera from "./components/NotPermissionCamera";

export const QRScannerScreen = () => {
  const {
    scanned,
    isActive,
    loading,
    handleCamera,
    startProcessing,
    restoreScanner,
    stopProcessing,
  } = useQRStatus();
  const { navigate } = useCustomNavigation();
  const route = useRoute();
  const pendingRedemption = (route.params as any)?.pendingRedemption;
  const { hasPermission, requestPermission } = useCameraPermission();
  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    startProcessing();

    try {
      const rawPaymentData = await WalletService.getDataPayment(data);

      const sanitized = sanitizePaymentData(rawPaymentData);

      const paymentData = buildPaymentData(sanitized);
      console.log("PaymentData", paymentData);
      if (!paymentData) {
        console.log("error payment");

        restoreScanner();
        Alert.alert(
          "QR no válido",
          "Los datos recibidos no parecen corresponder a un pago válido.",
        );

        return;
      }

      if (pendingRedemption) {
        paymentData.appliedRedemption = pendingRedemption;
      }

      if (isAdminQR(paymentData)) {
        console.log("es codigo qr de admin");

        // TODO CHEQUEAR SI CORRESPONDE ESTO
        // restoreScanner();
        // Alert.alert(
        //   "QR no válido",
        //   "El código QR escaneado pertenece a una cuenta administrativa y no corresponde a una máquina de cobro.",
        // );

        // return;
      }

      stopProcessing();
      navigate("PaymentScreen", {
        paymentData,
      });
    } catch (err: any) {
      restoreScanner();

      const status =
        err?.status ?? err?.statusCode ?? err?.body?.status ?? null;

      if (status === 500) {
        Alert.alert(
          "Error del servidor",
          "Ocurrió un error interno al procesar este QR en el servidor. Intenta de nuevo más tarde o contacta soporte.",
        );
      } else {
        Alert.alert("Error", "No se pudo obtener los datos de pago");
      }

      console.error("[QRScanner]", err);
    }
  };

  if (hasPermission === null) {
    return <LoadingPermissionCamera />;
  }

  if (hasPermission === false) {
    return <NotPermissionCamera requestPermission={requestPermission} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ThemedHeader
        title="Escanear QR"
        subtitle="Apunta la cámara hacia el código QR"
        canGoBack
      />
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
          onPress={handleCamera}
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
