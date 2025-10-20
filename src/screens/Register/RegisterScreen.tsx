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
import { CircleArrowLeftIcon } from "lucide-react-native";
import { authService } from "src/services/auth/auth.service";
export type RegisterFormData = {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  country: string;
  city: string;
};
export default function RegisterScreen() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("window");
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "error" });
  const [FormData, setFormData] = useState<RegisterFormData>({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "Belgrano",
    country: "Argentina",
    city: "Posadas",
  });

  // TODO HANDLE AUTH
  const isLoading = false;
  const handleRegister = async () => {
    if (!FormData.email.trim() || !FormData.password.trim()) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }
    FormData.confirmPassword = FormData.password;
    try {
      const success = await authService.registerUser(FormData);
      if (!success) {
        setAlert({
          visible: true,
          title: "Error",
          message: "Credenciales incorrectas",
          type: "error",
        });
      }
      await authService.loginWithEmail(FormData.email, FormData.password);
      navigation.navigate("MainTabs" as never);
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

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <BelandLogo
        width={width * 0.5}
        height={height * 0.2}
        style={styles.logo}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("MainTabs" as never)}
        style={styles.backButton}
      >
        <CircleArrowLeftIcon size={32} color="#FFF" />
      </TouchableOpacity>
      <LoginWave />
      <View style={styles.container}>
        <Text style={styles.title}>REGISTRARSE</Text>
        <CustomInput
          label="Nombre completo"
          onChangeText={(full_name) => setFormData({ ...FormData, full_name })}
          value={FormData.full_name}
        />
        <CustomInput
          label="Teléfono"
          onChangeText={(phone) => setFormData({ ...FormData, phone })}
          value={FormData.phone}
          keyboardType="phone-pad"
        />
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
          title={isLoading ? "Cargando..." : "Registrarse"}
          onPress={handleRegister}
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <View style={styles.containerRow}>
          <Text style={styles.subtitle}>¿Ya tienes cuenta? </Text>
          <Button
            variant="ghost"
            title="Ingresar"
            textStyle={styles.buttonLink}
            onPress={() => navigation.navigate("Login" as never)}
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
