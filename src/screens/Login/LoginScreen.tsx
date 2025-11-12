import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  CustomAlert,
  CustomInput,
  SocialButton,
  Button,
} from "@components/shared";
import { LoginWave } from "@components/ui";
import BelandLogo from "src/components/icons/BelandLogo";
import { styles } from "./styles";
import { useAuth } from "src/context";
import { CircleArrowLeftIcon } from "lucide-react-native";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export default function LoginScreen() {
  const {navigate} = useCustomNavigation();
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
  if (isAuthenticated) navigate("MainTabs", { screen: "Home" });
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
    navigate("MainTabs", { screen: "Home" })
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => navigate("MainTabs", { screen: "Home" })}
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
          title="Ingresar"
          onPress={handleLogin}
          variant="secondary"
          isLoading={isLoading}
        />

        <View style={styles.containerRow}>
          <Text style={styles.subtitle}>¿Eres nuevo? </Text>
          <Button
            title="Registrate"
            onPress={() => navigate("Register")}
            style={{ paddingLeft: 0 }}
          />
        </View>
        <Button
          title="Olvide mi contraseña"
          onPress={() => navigate("NewPassword")}
          textStyle={styles.forgetText}
          style={{ paddingLeft: 0, marginRight: "auto" }}
        />
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
