import React from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LoginWave } from "@/components/ui";
import { BelandLogo } from "@/components/icons";
import { styles } from "./styles";
import { colors } from "src/design-system/tokens";
import { CircleArrowLeftIcon } from "lucide-react-native";
import RegisterStep from "./components/RegisterStep";
import { useRegister } from "./hook/useRegister";
import CodeStep from "../NewPassword/components/Code.step";

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  phone: string;
  full_name: string;
  profile_picture_url?: string;
  address: string;
  city: string;
  country: string;
};
export default function RegisterScreen() {
  const { width, height } = Dimensions.get("window");
  const {
    FormData,
    step,
    handleRegister,
    isLoading,
    navigate,
    onChangeText,
    handleReSendCode,
    handleStepBack,
    handleVerifyCode,
    errors,
  } = useRegister();

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <LoginWave />
      <View style={styles.pageWrapper}>
        {/* Left marketing panel */}
        <View style={styles.leftPanel}>
          <BelandLogo width={220} height={60} style={styles.logo} />
          <Text style={styles.leftPanelTitle}>Únete a la comunidad Beland</Text>
          <Text style={styles.leftPanelText}>
            Beland convierte residuos en monedas digitales, activa comunidades y
            crea un ecosistema donde todos se benefician.
          </Text>
        </View>

        {/* Right form panel */}
        <View style={styles.rightPanel}>
          <TouchableOpacity
            onPress={() => navigate("Login")}
            style={styles.backButton}
            accessibilityLabel="Volver al login"
          >
            <CircleArrowLeftIcon size={18} color={colors.brand.orange[500]} />
          </TouchableOpacity>

          <Text style={styles.formTitle}>
            {step === "register" ? "Crea tu cuenta" : "Confirma tu correo"}
          </Text>
          <Text style={styles.formSubtitle}>
            Comienza tu prueba gratuita de Beland
          </Text>

          {step === "register" && (
            <RegisterStep
              formData={FormData}
              onChangeText={onChangeText}
              handleRegister={handleRegister}
              isLoading={isLoading}
              errors={errors}
            />
          )}

          {step === "code" && (
            <CodeStep
              FormData={FormData}
              onResendCode={handleReSendCode}
              onStepBack={handleStepBack}
              onSubmit={handleVerifyCode}
              isLoading={isLoading}
            />
          )}

          <View style={{ marginTop: 8, alignItems: "center" }}>
            <Text style={{ color: colors.text.secondary }}>
              ¿Ya tienes una cuenta?{" "}
              <Text
                style={styles.smallTextLink}
                onPress={() => navigate("Login")}
              >
                Inicia sesión
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
