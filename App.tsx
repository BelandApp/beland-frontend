import "react-native-reanimated";
import React, { useRef, useEffect } from "react";
import "./global.css";
import { Platform } from "react-native";
import "react-native-gesture-handler";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";

import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  RootStackNavigator,
  RootStackParamList,
} from "./src/components/layout/RootStackNavigator";
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { useAuth, AuthProvider } from "src/context";
import { TokenService } from "src/services/auth/token.service";
import { SocketService } from "src/services/SocketService";
import { NotificationProvider } from "./src/hooks/NotificationContext";
import { NotificationBanner } from "./src/components/shared/notification";
import { usePaymentSocket } from "src/hooks/usePaymentSocket";
import { useOrderSocket } from "src/hooks/useOrderSocket";
import { colors } from "src/styles";
import { useBeCoinsAutoRefresh } from "src/stores/becoin/useBeCoinsAutoRefresh";
import {
  GlobalNotification,
  toastConfig,
} from "src/components/shared/notification/GlobalNotification";
import Toast from "react-native-toast-message";
import { ErrorBoundary } from "src/components/layout/ErrorBoundary";
import { TooltipProvider } from "src/components/shared/tooltip/Tooltip.portal";
import { DeepLinkService } from "src/services/deepLink/deepLink.service";

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  useBeCoinsAutoRefresh();
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Conexión global a sockets para notificaciones de pagos
  usePaymentSocket(() => {});
  useOrderSocket(() => {});

  // deepLink intent
  useEffect(() => {
    const handlePendingIntent = async () => {
      if (!isAuthenticated) return;
      const intent = await DeepLinkService.getIntent();
      if (intent) {
        navigationRef.current?.navigate(intent.screen, intent.params);
        await DeepLinkService.clearIntent();
      }
    };

    handlePendingIntent();
  }, [isAuthenticated]);
  // Conectar socket globalmente una sola vez usando el token almacenado
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await TokenService.getToken();
        if (mounted && token) {
          SocketService.getInstance().connect(token);
        }
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Padding dinámico para web móvil
  useEffect(() => {
    const configureSystemBars = async () => {
      if (Platform.OS === "android") {
        // Ocultar barra de navegación
        await NavigationBar.setVisibilityAsync("hidden");
        // Ocultar barra de estado también
        setStatusBarHidden(true, "slide");
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

  // Configuración de linking para rutas web
  const linking = {
    prefixes: [
      "http://localhost:8081",
      "https://beland-project.netlify.app",
      "https://beland.app",
    ],
    config: {
      screens: {
        MainTabs: "",
        PayphoneSuccess: "payphone-success",
        CanjearScreen: "canjear",
        SendScreen: "send/:id?",
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
        UserResources: "user-resources",
        Login: "Login",
        Register: "Register",
      },
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.belandOrange }}>
      <StatusBar style="light" />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootStackNavigator />
        <NotificationBanner />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          {/* <SocketStatus /> */}
          <Toast config={toastConfig} />
          <ErrorBoundary>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </ErrorBoundary>
          <GlobalNotification />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
