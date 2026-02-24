import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { CustomInput, SocialButton, Button } from "@components/shared";
import { LoginWave } from "@components/ui";
import { BelandLogo } from "@/components";
import { styles } from "./styles";
import { CircleArrowLeftIcon, Mail } from "lucide-react-native";
import { useLogin } from "./hook/useLogin";
import { useAuth } from "src/context";
export default function LoginScreen() {
  const { width, height } = Dimensions.get("window");
  const [showLocalLogin, setShowLocalLogin] = useState(false);
  const { user } = useAuth();
  const {
    handleLogin,
    handleLoginAuth0,
    setFormData,
    navigate,
    FormData,
    isLoading,
    errors,
  } = useLogin();
  useEffect(() => {
    if (!isLoading && user) {
      navigate("MainTabs", {
        screen: "Home",
      });
    }
  }, [user, isLoading]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <SocialButton onPress={handleLoginAuth0} disabled={isLoading} />

          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "rgba(64, 45, 45, 0.2)",
              marginVertical: "4%",
            }}
          />

          {!showLocalLogin ? (
            <TouchableOpacity
              onPress={() => setShowLocalLogin(true)}
              style={styles.localLoginButton}
            >
              <Mail size={20} color="#FF6B35" />
              <Text style={styles.localLoginButtonText}>
                Ingresar con email y contraseña
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.subtitle}>Ingresar con tu correo:</Text>
              <CustomInput
                label="Correo Electrónico"
                onChangeText={(email) => setFormData({ ...FormData, email })}
                value={FormData.email}
                keyboardType="email-address"
                error={errors.email}
                variant="filled"
              />

              <CustomInput
                label="Contraseña"
                onChangeText={(password) =>
                  setFormData({ ...FormData, password })
                }
                value={FormData.password}
                secureTextEntry
                error={errors.password}
                variant="filled"
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
                  textStyle={styles.forgetText}
                  variant="inline"
                />
              </View>
              <Button
                title="Olvide mi contraseña"
                onPress={() => navigate("NewPassword")}
                textStyle={styles.forgetText}
                style={{ marginRight: "auto" }}
                variant="inline"
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
