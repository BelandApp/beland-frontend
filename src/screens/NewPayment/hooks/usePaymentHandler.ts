import { useState } from "react";
import { Alert } from "react-native";
import { becoinService } from "../services/becoinService";
import { payWithPayphone } from "../services/payphoneService";
import { convertBeCoinsToUSD } from "src/constants";
import { User } from "src/context";
import { PaymentMethod } from "../components/PaymentMehotdSelector";

export const usePaymentHandler = (user?: User) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"methods" | "payment">("methods");

  const changeStatus = (newStatus: "methods" | "payment") => setStatus(newStatus);
  const handlePayment = async ({
    method,
    productId,
    amount,
  }: {
    method: string;
    productId: string;
    amount: number;
  }) => {
    if (!user) return Alert.alert("Error", "Usuario no autenticado");
    try {
      setLoading(true);
      setStatus("payment");
      if (method === PaymentMethod.Tarjetas) {
        const usd = convertBeCoinsToUSD(amount);
        await payWithPayphone(usd, productId, user);
      } else if (method === PaymentMethod.BeCoins) {
        await becoinService.buyEventPass(amount, productId, user);
      }

      Alert.alert("Éxito", "Pago completado con éxito 🎉");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleFreeAcquisition = async (productId: string) => {
    if (!user) return Alert.alert("Error", "Usuario no autenticado");
    try {
      setLoading(true);
      await becoinService.acquireFreeProduct(productId, user);
      Alert.alert("Éxito", "Adquisición completada con éxito 🎉");
    } catch {
      Alert.alert("Error", "No se pudo procesar la adquisición");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    status,
    handlePayment,
    handleFreeAcquisition,
    setStatus,
    changeStatus,
  };
};
