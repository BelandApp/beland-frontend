import { useState } from "react";
import { Alert } from "react-native";
import { becoinService } from "../services/becoinService";
import { payWithPayphone } from "../services/payphoneService";
import { convertBeCoinsToUSD } from "src/constants";
import { useAuth, User } from "src/context";
import { PaymentMethod } from "../components/PaymentMehotdSelector";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage } from "src/services";

export const usePaymentHandler = (
  user: User,
  total_amount: number,
  productId: string,
  balance: number,
) => {
  const [loading, setLoading] = useState(false);
  const { navigate } = useCustomNavigation();
  const { handleAuth0Login } = useAuth();
  const isFree =
    !total_amount || total_amount === 0 || Number.isNaN(total_amount);
  const canPurchase = isFree || balance >= total_amount;
  const [Form, setForm] = useState({
    holder_name: user.full_name ?? "",
    holder_email: user.email ?? "",
    holder_phone: user.phone ?? "",
    holder_instagram_tiktok: "",
    event_pass_id: productId,
  });

  const handlePayment = async () => {
    if (!user) {
      notify.confirm({
        message: "Debes estar logueado",
        onConfirm: () => handleAuth0Login(),
      });
      return;
    }
    if (!canPurchase && !isFree) {
      notify.confirm({
        message: "No tienes suficiente saldo",
        onConfirm: () => navigate("RechargeScreen"),
      });
      return;
    }
    try {
      setLoading(true);
      const response: any = await becoinService.acquireProduct(Form);

      // Mostrar notificación global con acción para ver entradas
      notify.success({
        message: "Entrada adquirida con éxito",
      });
      navigate("MisEntradas", { tab: "Próximos" });
    } catch (error) {
      console.error(error);
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    } finally {
      setLoading(false);
    }
  };

  return {
    Form,
    setForm,
    loading,
    isFree,
    canPurchase,
    handlePayment,
  };
};
