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

export const useWalletActions = () => {
  const { navigate } = useCustomNavigation();

  // Obtener rol del usuario
  const { user } = useAuth();

  // Acciones principales del wallet
  const mainWalletActions: WalletAction[] = [
    {
      id: "recharge",
      label: "Recargar",
      icon: RechargeIcon,
      color: "#1E40AF",
      bgColor: "#DBEAFE",
      onPress: () => navigate("RechargeScreen"),
    },
    {
      id: "exchange",
      label: "Canjear",
      icon: ExchangeIcon,
      color: "#EA580C",
      bgColor: "#FED7AA",
      onPress: () => navigate("CanjearScreen"),
    },
    {
      id: "receive",
      label: "Recibir",
      icon: ReceiveIcon,
      color: "#059669",
      bgColor: "#D1FAE5",
      onPress: () => navigate("ReceiveScreen"),
    },
  ];

  // TODO CHEQUEAR botón Cobrar solo para roles permitidos
  if (
    typeof user?.role_name === "string" &&
    ["COMMERCE", "ADMIN", "SUPERADMIN", "EMPRESA"].includes(
      user.role_name.toUpperCase(),
    )
  ) {
    mainWalletActions.push({
      id: "cobrar",
      label: "Cobrar",
      icon: CobrarIcon,
      color: "#7C3AED",
      bgColor: "#EDE9FE",
      onPress: () => navigate("CobrarScreen"),
    });
  }

  // Acción final
  mainWalletActions.push({
    id: "send",
    label: "Enviar",
    icon: SendIcon,
    color: "#DC2626",
    bgColor: "#FEE2E2",
    onPress: () => navigate("SendScreen", { id: "0" }),
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
