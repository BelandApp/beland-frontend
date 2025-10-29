import { useState } from "react";
import { Alert } from "react-native";
import { becoinService } from "../services/becoinService";
import { payWithPayphone } from "../services/payphoneService";
import { convertBeCoinsToUSD } from "src/constants";
import { User } from "src/context";
import { PaymentMethod } from "../components/PaymentMehotdSelector";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { StackNavigationProp } from "@react-navigation/stack";

export const usePaymentHandler = (user?: User) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"methods" | "payment">("methods");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const changeStatus = (newStatus: "methods" | "payment") =>
    setStatus(newStatus);
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

  const handleFreeAcquisition = async (eventDto: any) => {
    if (!user) return Alert.alert("Error", "Usuario no autenticado");
    try {
      setLoading(true);
      await becoinService.acquireFreeProduct(eventDto);
      navigation.navigate("MainTabs");
    } catch {
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
