import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { CustomInput, SocialButton, Button } from "@components/shared";
import { LoginWave } from "@components/ui";
import { BelandLogo } from "@/components";
import { styles } from "./styles";
import { CircleArrowLeftIcon } from "lucide-react-native";
import { useLogin } from "./hook/useLogin";

export default function LoginScreen() {
  const { width, height } = Dimensions.get("window");
  const {
    handleLogin,
    handleLoginAuth0,
    setFormData,
    navigate,
    FormData,
    isLoading,
    isAuthenticated,
  } = useLogin();
  if (isAuthenticated) navigate("MainTabs", { screen: "Home" });
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
        <SocialButton onPress={handleLoginAuth0} disabled={isLoading} />
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
    </ScrollView>
  );
}
