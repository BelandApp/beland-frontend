import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import {
  SendIcon,
  ReceiveIcon,
  ExchangeIcon,
  CobrarIcon,
  RechargeIcon,
} from "@/components/icons";
import { useAuth } from "src/context";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useCustomNavigation, useNotify } from "src/hooks";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  color: string;
  bgColor: string;
}



export const QuickActions = ({
}) => {
  const { user } = useAuth();
  const {navigate}=useCustomNavigation()
  const { isMobile } = useResponsiveLayout();

  // Ocultar QuickActions si el usuario no está logueado
  if (!user) {
    return null;
  }

  const baseActions: QuickAction[] = [
    {
      id: "recharge",
      label: "Recargar",
      icon: RechargeIcon,
      onPress: ()=>navigate("RechargeScreen"),
      color: "#1E40AF",
      bgColor: "#DBEAFE",
    },
    {
      id: "send",
      label: "Enviar",
      icon: SendIcon,
      onPress: ()=>navigate("SendScreen"),
      color: "#DC2626",
      bgColor: "#FEE2E2",
    },
    {
      id: "receive",
      label: "Recibir",
      icon: ReceiveIcon,
      onPress: ()=>navigate("ReceiveScreen"),
      color: "#059669",
      bgColor: "#D1FAE5",
    },
    {
      id: "exchange",
      label: "Canjear",
      icon: ExchangeIcon,
      onPress: ()=>navigate("CanjearScreen"),
      color: "#EA580C",
      bgColor: "#FED7AA",
    },
  ];

  // Agregar botón Cobrar solo para roles permitidos
  const actions = [...baseActions];

  const shouldShowCollect =
    (typeof user?.role_name === "string" &&
      ["COMMERCE", "ADMIN", "SUPERADMIN", "EMPRESA"].includes(
        user.role_name.toUpperCase()
      )) ||
    (user?.role &&
      typeof user.role === "object" &&
      user.role !== null &&
      "name" in user.role &&
      typeof (user.role as any).name === "string" &&
      ["COMMERCE", "ADMIN", "SUPERADMIN", "EMPRESA"].includes(
        (user.role as any).name.toUpperCase()
      ));

  if (shouldShowCollect) {
    // Insertar Cobrar antes de Canjear
    actions.splice(-1, 0, {
      id: "collect",
      label: "Cobrar",
      icon: CobrarIcon,
      onPress: () => navigate("CobrarScreen"),
      color: "#7C3AED",
      bgColor: "#EDE9FE",
    });
  }


  // Estilos dinámicos para centrar según el dispositivo
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...styles.title,
      textAlign: "center",
      width: "100%",
    },
    actionsGrid: {
      ...styles.actionsGrid,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      maxWidth: Platform.OS === "web" ? (isMobile ? 320 : 600) : "100%",
    },
    actionButton: {
      ...styles.actionButton,
      width: Platform.OS === "web" ? (isMobile ? "45%" : "18%") : "22%",
      minWidth: Platform.OS === "web" ? (isMobile ? 100 : 120) : 100,
      maxWidth: Platform.OS === "web" ? (isMobile ? 140 : 160) : 100,
    },
  });

  return (
    <>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.title}>Acciones Rápidas</Text>
        <View style={dynamicStyles.actionsGrid}>
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                style={[
                  dynamicStyles.actionButton,
                  { borderColor: action.color + "20" },
                ]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: action.bgColor },
                  ]}
                >
                  <IconComponent width={24} height={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: Platform.OS === "web" ? 0 : 16,
    marginVertical: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: Platform.OS === "web" ? 24 : 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: Platform.OS === "web" ? 22 : 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Platform.OS === "web" ? 16 : 8,
  },
  actionButton: {
    alignItems: "center",
    padding: Platform.OS === "web" ? 16 : 12,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: Platform.OS === "web" ? 52 : 44,
    height: Platform.OS === "web" ? 52 : 44,
    borderRadius: Platform.OS === "web" ? 26 : 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Platform.OS === "web" ? 12 : 8,
  },
  actionLabel: {
    fontSize: Platform.OS === "web" ? 13 : 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 16,
  },
});
