import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  CustomInput,
  SocialButton,
  Button,
  WrapperModal,
  PhoneInput,
} from "@components/shared";
import { LoginWave } from "@components/ui";
import { BelandLogo } from "@/components";
import { styles } from "./styles";
import { CircleArrowLeftIcon, Mail, Phone } from "lucide-react-native";
import { useLogin } from "./hook/useLogin";
import { useAuth } from "src/context";
import { colors } from "src/design-system";
import { useResponsiveLayout } from "src/hooks";
import { notify } from "src/hooks/notification/notify.external";
export default function LoginScreen() {
  const { screenWidth, screenHeight } = useResponsiveLayout();
  const { user } = useAuth();
  const {
    handleLogin,
    handleLoginAuth0,
    setFormData,
    navigate,
    FormData,
    status,
    errors,
    showPhoneModal,
    setShowPhoneModal,
    showLocalLogin,
    setShowLocalLogin,
    phone,
    handleAddPhone,
    setPhone,
  } = useLogin();
  useEffect(() => {
    if (status != "loading" && user?.phone) {
      navigate("MainTabs", {
        screen: "Home",
      });
    }
    if (status === "authenticated" && !user?.phone) {
      setShowPhoneModal(true);
    }
  }, [user, status]);
  const handleBeforeClose = () => {
    return new Promise<boolean>((resolve) => {
      notify.confirm({
        message:
          "Esto es necesario para poder disfrutar de los servicios de Beland. ¿Cerrar igualmente?",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };
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
          width={screenWidth * 0.5}
          height={screenHeight * 0.2}
          style={styles.logo}
        />
        <LoginWave />
        <View style={styles.container}>
          <SocialButton
            onPress={handleLoginAuth0}
            disabled={status === "loading"}
          />

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
                isLoading={status === "loading"}
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
      <WrapperModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        beforeClose={handleBeforeClose}
        header={
          <View className="flex-row items-center gap-2">
            <Phone color={colors.brand.orange[500]} />
            <Text className="font-semibold">
              Termina de configurar tu cuenta
            </Text>
          </View>
        }
        content={
          <View>
            <PhoneInput
              value={phone}
              onChange={(value) => setPhone(value)}
              required
              error={errors.phone}
            />
            <Image
              source={require("../../../assets/phoneRequired.png")}
              className="rounded-3xl shadow mx-auto"
              resizeMode="contain"
              style={{
                zIndex: 1,
                width: screenWidth / 2,
                height: screenHeight / 2,
              }}
            />
          </View>
        }
        actions={
          <Button title="Guardar" onPress={handleAddPhone} disabled={!phone} />
        }
      />
    </KeyboardAvoidingView>
  );
}
