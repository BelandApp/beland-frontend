import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import SocialButton from "@components/shared/buttons/Social.button";
import { LoginWave } from "@components/ui";
import { BelandLogo } from "@/components";
import { styles } from "./styles";
import { CircleArrowLeftIcon } from "lucide-react-native";
import { useLogin } from "./hook/useLogin";
import { GoogleIcon } from "src/components/icons/socials/Google";
import { FacebookIcon } from "src/components/icons/socials/Facebook";
import { AppleIcon } from "src/components/icons/socials/Apple";

export default function LoginScreen() {
  const { width, height } = Dimensions.get("window");
  const { handleLoginAuth0, navigate, isLoading, isAuthenticated } = useLogin();
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
        height={height * 0.13}
        style={styles.logo}
      />
      <LoginWave />
      <View
        style={[
          styles.container,
          {
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <Text style={[styles.title, { marginTop: 16 }]}>
          Bienvenido de nuevo
        </Text>
        <Text style={[styles.subtitle, { marginBottom: 16 }]}>
          Inicia sesión para acceder a tu panel
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: "#E0E0E0",
            width: "100%",
            marginVertical: 16,
          }}
        />
        <Text
          style={{
            color: "#888",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Continúa con
        </Text>
        <View style={{ gap: 16 }}>
          <TouchableOpacity
            style={{
              position: "relative",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              paddingVertical: 12,
              paddingRight: 16,
              paddingLeft: 56,
              marginBottom: 8,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
            onPress={handleLoginAuth0}
            disabled={isLoading}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <GoogleIcon width={24} height={24} />
            </View>
            <Text
              style={{
                fontWeight: "700",
                color: "#222",
                fontSize: 16,
                textAlign: "center",
                width: "100%",
              }}
            >
              Continuar con Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              position: "relative",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              paddingVertical: 12,
              paddingRight: 16,
              paddingLeft: 56,
              marginBottom: 8,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
            onPress={handleLoginAuth0}
            disabled={isLoading}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FacebookIcon width={24} height={24} />
            </View>
            <Text
              style={{
                fontWeight: "700",
                color: "#222",
                fontSize: 16,
                textAlign: "center",
                width: "100%",
              }}
            >
              Continuar con Facebook
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              position: "relative",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              paddingVertical: 12,
              paddingRight: 16,
              paddingLeft: 56,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
            onPress={handleLoginAuth0}
            disabled={isLoading}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AppleIcon width={24} height={24} />
            </View>
            <Text
              style={{
                fontWeight: "700",
                color: "#222",
                fontSize: 16,
                textAlign: "center",
                width: "100%",
              }}
            >
              Continuar con Apple
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 32, alignItems: "center" }}>
          <Text style={{ color: "#888" }}>
            ¿No tienes una cuenta?{" "}
            <Text
              style={{ color: "#ff8800", fontWeight: "bold" }}
              onPress={() => navigate("Register")}
            >
              Regístrate
            </Text>
          </Text>
        </View>
      </View>
      <View
        style={{
          width: styles.container.width || Math.min(width - 32, 680),
          alignSelf: "center",
        }}
      >
        <View style={styles.mirrorBar} />
      </View>
    </ScrollView>
  );
}
