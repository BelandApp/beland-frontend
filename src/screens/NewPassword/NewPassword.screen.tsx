import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LoginWave } from "src/components/ui/waves/Login.wave";
import EmailStep from "./components/Email.step";
import CodeStep from "./components/Code.step";
import NewPasswordStep from "./components/NewPassword";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { CircleArrowLeftIcon } from "lucide-react-native";
import BelandLogo from "src/components/icons/BelandLogo";
import { useResetPassword } from "./hook/useResetPassword";

export const NewPasswordScreen = () => {
  const { navigate } = useCustomNavigation();
  const { width, height } = Dimensions.get("window");
  const {
    FormData,
    handleCode,
    handleMail,
    handlePassword,
    handleReSendCode,
    handleStepBack,
    isLoading,
    step,
  } = useResetPassword();

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Recuperar Contraseña";
      case "code":
        return "Verificar Código";
      case "password":
        return "Nueva Contraseña";
      default:
        return "Recuperar Contraseña";
    }
  };

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      position: "relative",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flexDirection: "column",
      marginHorizontal: "auto",
      marginBottom: "auto",
      padding: 24,
      borderRadius: 24,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      width: width > 600 ? 600 : width,
      gap: 16,
      backgroundColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: "#FF6B35",
      textAlign: "center",
      marginBottom: 4,
    },
    backButton: {
      position: "absolute",
      top: 40,
      left: 20,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: 50,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 10,
    },
    logo: {
      alignSelf: "center",
      marginTop: 8,
    },
  });

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
          <Text style={styles.title}>{getStepTitle()}</Text>

          {step === "email" && (
            <EmailStep onSubmit={handleMail} isLoading={isLoading} />
          )}
          {step === "code" && (
            <CodeStep
              onSubmit={handleCode}
              onResendCode={handleReSendCode}
              onStepBack={handleStepBack}
              isLoading={isLoading}
              FormData={FormData}
            />
          )}
          {step === "password" && <NewPasswordStep onSubmit={handlePassword} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewPasswordScreen;
