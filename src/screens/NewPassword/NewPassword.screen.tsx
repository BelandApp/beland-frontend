import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { CustomInput } from "src/components/shared";
import { LoginWave } from "src/components/ui/waves/Login.wave";
import { colors } from "src/styles";
import EmailStep from "./components/Email.step";
import CodeStep from "./components/Code.step";
import NewPasswordStep from "./components/NewPassword";
import { authService } from "src/services";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { CircleArrowLeftIcon } from "lucide-react-native";
import BelandLogo from "src/components/icons/BelandLogo";
import { useResetPassword } from "./hook/useResetPassword";

const NewPasswordScreen = () => {
  const { navigate } = useCustomNavigation();
  const { width, height } = Dimensions.get("window");
  const {
    handleCode,
    handleMail,
    handlePassword,
    handleReSendCode,
    handleStepBack,
    isLoading,
    step,
  } = useResetPassword();

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => navigate("Login")}
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
        <Text style={styles.title}>Recuperar contraseña</Text>
        {step === "email" && <EmailStep onSubmit={handleMail} isLoading={isLoading} />}
        {step === "code" && (
          <CodeStep
            onSubmit={handleCode}
            onResendCode={handleReSendCode}
            onStepBack={handleStepBack}
            isLoading={isLoading}
          />
        )}
        {step === "password" && <NewPasswordStep onSubmit={handlePassword} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    position: "relative",
  },
  container: {
    backgroundColor: colors.belandOrange,
    marginHorizontal: "auto",
    marginBottom: "auto",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: colors.background,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: colors.belandOrange,
    borderRadius: 50,
    padding: 10,
  },
  logo: { margin: "auto", marginTop: 20 },
});

export default NewPasswordScreen;
