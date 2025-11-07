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
import { CustomInput, PhoneInput } from "src/components/shared/input";
import { Button } from "src/components/ui";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import { SocialButton } from "src/components/shared";
import { CircleArrowLeftIcon } from "lucide-react-native";
import { authService } from "src/services/auth/auth.service";
import { useValidation } from "src/hooks/form/useValidation";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import ThemedButton from "src/components/shared/buttons/Themed.button";

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  address: string;
  phone: string;
  country: string;
  city: string;
  full_name: string;
  profile_picture_url?: string;
};
export default function RegisterScreen() {
  const { navigate } = useCustomNavigation();
  const { width, height } = Dimensions.get("window");
  const { validateForm } = useValidation();
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "error" });
  const [FormData, setFormData] = useState<RegisterFormData>({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    country: "",
    city: "",
  });

  // TODO HANDLE AUTH
  const isLoading = false;
  const handleRegister = async () => {
    FormData.confirmPassword = FormData.password;
    const isValid = validateForm(FormData);
    if (!isValid) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }
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
      navigate("MainTabs");
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
        onPress={() => navigate("MainTabs")}
        style={styles.backButton}
      >
        <CircleArrowLeftIcon size={32} color="#FFF" />
      </TouchableOpacity>
      <LoginWave />
      <View style={styles.container}>
        <Text style={styles.title}>REGISTRARSE</Text>
        <View style={styles.inputsContainer}>
          <CustomInput
            label="Nombre completo"
            onChangeText={(full_name) =>
              setFormData({ ...FormData, full_name })
            }
            value={FormData.full_name}
          />
          <PhoneInput
            value={FormData.phone}
            onChange={(phone) => setFormData({ ...FormData, phone })}
          />
        </View>
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
        <ThemedButton label="Registrarse" onPress={handleRegister} variant="secondary"/>
        <View style={styles.containerRow}>
          <Text style={styles.subtitle}>¿Ya tienes cuenta? </Text>
          <ThemedButton
            label="Ingresar"
            onPress={() => navigate("Login")}
            style={styles.buttonLink}
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
