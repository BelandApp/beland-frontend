import { WalletAction } from "../types";
import {
  ExchangeIcon,
  SendIcon,
  ReceiveIcon,
  RechargeIcon,
  CobrarIcon,
} from "../../../components/icons";
import { useAuth } from "src/context";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export const useWalletActions = (
  showCustomAlert?: (
    title: string,
    message: string,
    type?: "success" | "error" | "info"
  ) => void
) => {
   const { navigate } = useCustomNavigation();

  // Obtener rol del usuario
  const { user } = useAuth();

  // Acciones principales del wallet
  const mainWalletActions: WalletAction[] = [
    {
      id: "recharge",
      label: "Recargar",
      icon: RechargeIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigate("RechargeScreen"),
    },
    {
      id: "send",
      label: "Enviar",
      icon: SendIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigate("SendScreen"),
    },
    {
      id: "receive",
      label: "Recibir",
      icon: ReceiveIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigate("ReceiveScreen"),
    },
  ];

  // TODO CHEQUEAR botón Cobrar solo para roles permitidos
  if (
    (typeof user?.role_name === "string" &&
      ["COMMERCE", "ADMIN", "SUPERADMIN", "EMPRESA"].includes(
        user.role_name.toUpperCase()
      )) ||
    (user?.role &&
      typeof user.role === "object" &&
      user.role &&
      typeof user.role === "string" &&
      ["COMMERCE", "ADMIN", "SUPERADMIN", "EMPRESA"].includes(
        user.role.toUpperCase()
      ))
  ) {
    mainWalletActions.push({
      id: "cobrar",
      label: "Cobrar",
      icon: CobrarIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigate("CobrarScreen"),
    });
  }

  // Acción final
  mainWalletActions.push({
    id: "exchange",
    label: "Canjear",
    icon: ExchangeIcon,
    backgroundColor: "#FFFFFF",
    onPress: () => navigate("CanjearScreen"),
  });

  // Acciones secundarias - sin historial ya que está integrado en la vista principal
  const secondaryWalletActions: WalletAction[] = [];

  return {
    mainWalletActions,
    secondaryWalletActions,
    // Mantener retrocompatibilidad
    walletActions: mainWalletActions,
  };
};
