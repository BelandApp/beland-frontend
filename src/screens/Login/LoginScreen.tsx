import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { LoginWave } from "src/components/ui/waves/Login.wave";
import BelandLogo from "src/components/icons/BelandLogo";
import { CustomInput } from "src/components/shared/input";
import { Button } from "src/components/ui";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import { SocialButton } from "src/components/shared";
import { useAuth } from "src/context";
import { CircleArrowLeftIcon } from "lucide-react-native";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { handleAuth0Login, loginWithEmail, user, isAuthenticated, isLoading } =
    useAuth();
  const { width, height } = Dimensions.get("window");
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "error" });
  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });
  if (isAuthenticated) navigation.navigate("MainTabs");
  const handleLogin = async () => {
    if (!FormData.email.trim() || !FormData.password.trim()) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }
    try {
      await loginWithEmail(FormData.email, FormData.password);
      if (!user) {
        setAlert({
          visible: true,
          title: "Error",
          message: "Credenciales incorrectas",
          type: "error",
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "No se pudo completar el inicio de sesión",
        type: "error",
      });
      console.error("[LOGIN] Error en loginWithEmailPassword:", error);
    }
  };

  const handleLoginAuth0 = async () => {
    await handleAuth0Login();
    navigation.navigate("MainTabs");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("MainTabs" as never)}
        style={styles.backButton}
      >
        <CircleArrowLeftIcon size={32} color="#FFF" />
      </TouchableOpacity>
      <BelandLogo
        width={width * 0.5}
        height={height * 0.2}
        style={styles.logo}
      />
      <LoginWave />
      <View style={styles.container}>
        <SocialButton onPress={handleLoginAuth0} />
        <View style={styles.container} />
        <CustomInput
          label="Correo Electrónico"
          onChangeText={(email) => setFormData({ ...FormData, email })}
          value={FormData.email}
          keyboardType="email-address"
        />
        <CustomInput
          label="Contraseña"
          onChangeText={(password) => setFormData({ ...FormData, password })}
          value={FormData.password}
          secureTextEntry
        />
        <Button
          title={isLoading ? "Cargando..." : "Entrar"}
          onPress={handleLogin}
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <View style={styles.containerRow}>
          <Text style={styles.subtitle}>¿Eres nuevo? </Text>
          <Button
            variant="ghost"
            title="Registrarse"
            textStyle={styles.buttonLink}
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </View>
      {/* CustomAlert para errores y demo */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </ScrollView>
  );
}
