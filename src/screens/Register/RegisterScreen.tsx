import React from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { LoginWave } from "@/components/ui";
import { BelandLogo } from "@/components/icons";
import { styles } from "./styles";
import { CircleArrowLeftIcon } from "lucide-react-native";
import RegisterStep from "./components/RegisterStep";
import { useRegister } from "./hook/useRegister";
import CodeStep from "../NewPassword/components/Code.step";
import { Button } from "src/components";
import { Platform } from "react-native";
import PrevRegister from "./components/PrevRegister.step";

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
    setStep,
    handleRegister,
    isLoading,
    navigate,
    onChangeText,
    handleReSendCode,
    handleStepBack,
    handleVerifyCode,
    errors,
    handlePrevRegister,
  } = useRegister();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigate("Login")}
          style={styles.backButton}
        >
          <CircleArrowLeftIcon size={24} color="#FF6B35" />
        </TouchableOpacity>

        <LoginWave />

        <BelandLogo
          width={width * 0.4}
          height={height * 0.15}
          style={styles.logo}
        />

        <View style={styles.container}>
          <Text style={styles.title}>
            {step === "register" ? "Crear Cuenta" : "Verificar Correo"}
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
          {step === "prevRegister" && (
            <PrevRegister
              formData={FormData}
              onChangeText={onChangeText}
              handleRegister={handlePrevRegister}
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
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.simpleRow}>
            <Text style={styles.subtitle}>¿Ya tienes cuenta? </Text>
            <Button
              title="Inicia Sesión"
              onPress={() => navigate("Login")}
              style={{ paddingLeft: 0 }}
              textStyle={styles.buttonLink}
              variant="inline"
            />
          </View>
          {step === "register" && (
            <View style={styles.simpleRow}>
              <Text style={styles.subtitle}>¿Te falta validar tu correo? </Text>
              <Button
                title="Validar Cuenta"
                onPress={() => setStep("prevRegister")}
                style={{ paddingLeft: 0 }}
                textStyle={styles.buttonLink}
                variant="inline"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
