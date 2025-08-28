import React, { useRef, useState, useEffect, useMemo } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { useBeCoinsStoreHydration } from "./src/stores/useBeCoinsStore";

import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";

import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  RootStackNavigator,
  RootStackParamList,
} from "./src/components/layout/RootStackNavigator";
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { useAuth } from "src/hooks/AuthContext";
import { AuthProvider } from "src/hooks/AuthContext";
import PayphoneSuccessScreen from "./src/screens/Wallet/PayphoneSuccessScreen";
import SocketStatus from "./src/components/SocketStatus";

const AppContent = () => {
  // Declarar todos los hooks al inicio, sin condicionales
  const { user, isLoading } = useAuth();
  const isBeCoinsLoaded = useBeCoinsStoreHydration();
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(
    undefined
  );

  // Padding dinámico para web móvil
  const dynamicPaddingBottom = useMemo(() => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.innerWidth < 600
    ) {
      const tabbarHeight = 30;
      const extraBottom =
        typeof window.visualViewport !== "undefined" && window.visualViewport
          ? window.innerHeight - window.visualViewport.height
          : 0;
      return tabbarHeight + extraBottom;
    }
    return 0;
  }, []);

  useEffect(() => {
    const configureSystemBars = async () => {
      if (Platform.OS === "android") {
        try {
          // Ocultar barra de navegación
          await NavigationBar.setVisibilityAsync("hidden");
          // Ocultar barra de estado también
          setStatusBarHidden(true, "slide");
          console.log("Barras del sistema ocultas correctamente");
        } catch (error) {
          console.log("Error configurando las barras del sistema:", error);
        }
      }
    };
    configureSystemBars();

    const interval = setInterval(() => {
      if (Platform.OS === "android") {
        try {
          NavigationBar.setVisibilityAsync("hidden");
          setStatusBarHidden(true, "slide");
        } catch (error) {
          // Ignorar errores silenciosamente
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQRPress = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate("QR");
    }
  };

  const onNavigationStateChange = (state: NavigationState | undefined) => {
    if (state) {
      // Obtener la ruta actual del stack principal
      const currentRouteName = state.routes[state.index]?.name;
      setCurrentRoute(currentRouteName);
    }
  };

  // Solo mostrar el botón QR si no estamos en la pantalla QR, RecyclingMap ni en screens de acciones de la wallet
  const walletActionScreens = [
    "CanjearScreen",
    "SendScreen",
    "ReceiveScreen",
    "RechargeScreen",
    "WalletHistoryScreen",
  ];

  const shouldShowQRButton =
    currentRoute !== "QR" &&
    currentRoute !== "RecyclingMap" &&
    currentRoute &&
    !walletActionScreens.includes(currentRoute) &&
    !!user;

  const isPayphoneSuccess =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/payphone-success");

  if (isPayphoneSuccess) {
    return <PayphoneSuccessScreen />;
  }

  // Configuración de linking para rutas web
  const linking = {
    prefixes: ["http://localhost:8081", "https://beland-project.netlify.app"],
    config: {
      screens: {
        MainTabs: "",
        PayphoneSuccess: "payphone-success",
        CanjearScreen: "canjear",
        SendScreen: "send",
        ReceiveScreen: "receive",
        WalletHistoryScreen: "wallet-history",
        RechargeScreen: "recharge",
        WalletSettingsScreen: "wallet-settings",
        QR: "qr",
        RecyclingMap: "recycling-map",
        HistoryScreen: "history",
        UserDashboardScreen: "user-dashboard",
        GroupsScreen: "Groups",
        PaymentScreen: "payment",
      },
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onNavigationStateChange}
        linking={linking}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#F7F8FA",
            paddingBottom: dynamicPaddingBottom,
          }}
        >
          <RootStackNavigator />
          {shouldShowQRButton && <FloatingQRButton onPress={handleQRPress} />}
        </View>
      </NavigationContainer>
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketStatus />
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
