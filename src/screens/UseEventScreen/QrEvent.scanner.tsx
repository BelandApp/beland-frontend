import React, { useState, useEffect } from "react";
import type { StackNavigationProp } from "@react-navigation/stack";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import { colors } from "src/styles";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { Button } from "src/components/ui";
import { eventsService } from "src/services/events";
import {GoBackButton} from "src/components/shared/buttons/GoBack.button";
import { getBackendErrorMessage } from "src/services";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
export const QRUseEventScreen = ({ route }: { route: any }) => {
  const { id } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
    const { navigate } = useCustomNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: BarcodeScanningResult) => {
    if (scanned) return;
    // QR scanned
    try {
      setScanned(true);
      setIsActive(false);
      setLoading(true);
      // fetcheamos al backend
      const res = await eventsService.consumeQr(data, id);
      if (Platform.OS === "web") {
        localStorage.setItem("consumedEvent", JSON.stringify(res));
      }
     navigate("ConsumedEventScreen", {
        id,
        holder: res.userEventPass.holder_name,
      });
    } catch (err: any) {
       alert(getBackendErrorMessage(err));
    } finally {
      setLoading(false);
      setScanned(false);
      setIsActive(true);
    }
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
        <Pressable
          onPress={() => navigate("ConsumedEventScreen", { id })}
        >
          <Text>Ir</Text>
        </Pressable>
      </View>

      {/* Loader visual cuando está cargando datos de pago */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderCard}>
            <Text style={styles.loaderText}>Validando...</Text>
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
    position: "relative",
  },
  backbutton: {
    padding: 8,
    backgroundColor: colors.belandOrange,
    color: "white",
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
    borderRadius: 50,
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
