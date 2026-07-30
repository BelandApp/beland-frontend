import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ThemedHeader } from "src/components";
import { styles } from "./styles";

export const NotPermissionCamera = ({
  requestPermission,
}: {
  requestPermission: () => void;
}) => {
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ThemedHeader canGoBack title="Permisos para el QR" />
      <View style={styles.centerContent}>
        <Text style={styles.message}>
          Necesitamos acceso a la cámara para escanear códigos QR
        </Text>
        <Button
          title="Solicitar permisos"
          onPress={requestPermission}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotPermissionCamera;
