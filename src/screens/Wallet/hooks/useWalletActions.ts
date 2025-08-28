import { WalletAction } from "../types";
import {
  ExchangeIcon,
  TransactionIcon,
  SendIcon,
  ReceiveIcon,
  RechargeIcon,
  SettingsIcon,
} from "../../../components/icons";
import { useNavigation } from "@react-navigation/native";

export const useWalletActions = () => {
  const navigation = useNavigation();

  // Obtener rol del usuario
  const { user } = require("../../../hooks/AuthContext").useAuth();

  // Acciones principales del wallet
  const mainWalletActions: WalletAction[] = [
    {
      id: "recharge",
      label: "Recargar",
      icon: RechargeIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("RechargeScreen" as never),
    },
    {
      id: "send",
      label: "Enviar",
      icon: SendIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("SendScreen" as never),
    },
    // Mostrar solo a admin/comerciante (acepta role_name y role.name)
    ...(user?.role?.name === "ADMIN" ||
    user?.role?.name === "COMMERCE" ||
    user?.role?.name === "Comercio" ||
    user?.role_name === "COMMERCE" ||
    user?.role_name === "Comercio"
      ? [
          {
            id: "cobrar",
            label: "Cobrar",
            icon: ReceiveIcon,
            backgroundColor: "#FFFFFF",
            onPress: () => navigation.navigate("CobrarScreen" as never),
          },
        ]
      : [
          {
            id: "receive",
            label: "Recibir",
            icon: ReceiveIcon,
            backgroundColor: "#FFFFFF",
            onPress: () => navigation.navigate("ReceiveScreen" as never),
          },
        ]),
    {
      id: "exchange",
      label: "Canjear",
      icon: ExchangeIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("CanjearScreen" as never),
    },
  ];

  console.log("[WalletActions] mainWalletActions:", mainWalletActions);

  // Acciones secundarias - sin historial ya que está integrado en la vista principal
  const secondaryWalletActions: WalletAction[] = [];

  return {
    mainWalletActions,
    secondaryWalletActions,
    // Mantener retrocompatibilidad
    walletActions: mainWalletActions,
  };
};
