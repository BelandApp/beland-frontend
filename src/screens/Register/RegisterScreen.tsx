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
import { styles } from "./styles";
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
    alert,
    step,
    handleRegister,
    isLoading,
    navigate,
    setAlert,
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
      <BelandLogo
        width={width * 0.5}
        height={height * 0.2}
        style={styles.logo}
      />
      <TouchableOpacity
        onPress={() => navigate("MainTabs", { screen: "Home" })}
        style={styles.backButton}
      >
        <CircleArrowLeftIcon size={32} color="#FFF" />
      </TouchableOpacity>
      <LoginWave />
      <View style={styles.container}>
        <Text style={styles.title}>
          {step === "register" ? "Nueva cuenta" : "Confirma tu correo"}
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
            onResendCode={handleReSendCode}
            onStepBack={handleStepBack}
            onSubmit={handleVerifyCode}
            isLoading={isLoading}
          />
        )}
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
