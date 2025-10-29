import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useAuth } from "src/context";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { colors } from "src/design-system";
import { usePaymentHandler } from "./hooks/usePaymentHandler";
import CompanyHeader from "./components/CompanyHeader";
import {
  PaymentMethod,
  PaymentMethodsSelector,
} from "./components/PaymentMehotdSelector";
import { BankTransfer } from "../Payment/components/BankTransfer";
import { AdquisitionForm } from "./components/AdquisitionForm";
import { PaymentMethodSelector } from "../Payment";

export type PaymentScreenRoute = {
  product: {
    id: string;
    quantity: number;
    price: number;
    name: string;
    condition?: string;
  };
  total_amount?: number;
  company: { id: string; name: string; img: string };
  onSuccessEndpoint: string;
  canEditAmount?: boolean;
  canBuyForOthers?: boolean;
};
type PaymentScreenParam = { PaymentScreen: PaymentScreenRoute };
type PaymentScreenRouteProp = RouteProp<PaymentScreenParam, "PaymentScreen">;

export const NewPaymentScreen = () => {
  const { params } = useRoute<PaymentScreenRouteProp>();
  const { product, company, total_amount, canEditAmount, canBuyForOthers } =
    params;
  const { user } = useAuth();
  const [method, setMethod] = useState("Tarjetas");
  const [customAmount, setCustomAmount] = useState(
    total_amount?.toString() ?? ""
  );
  const isFree = !total_amount || total_amount === 0;
  if (!user) return null;
  const {
    loading,
    handlePayment,
    handleFreeAcquisition,
    status,
    changeStatus,
  } = usePaymentHandler(user);
  return (
    <View style={styles.content}>
      <ThemedHeader title="Compra" canGoBack />
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CompanyHeader company={company} total_amount={total_amount || 0} />

        {status === "methods" && isFree && (
          <View style={styles.container}>
            <Text>
              Esta entrada es gratuita, recuerda llevar tu reciclable o deberas
              abonar Usd $5
            </Text>
          </View>
        )}

        {status === "methods" && !isFree && (
          <PaymentMethodsSelector
            method={method}
            onSelect={setMethod}
            canEditAmount={canEditAmount}
            customAmount={customAmount}
            onChangeAmount={setCustomAmount}
            onConfirm={() =>
              handlePayment({
                method,
                productId: product.id,
                amount: Number(customAmount),
              })
            }
            loading={loading}
          />
        )}
        {status === "payment" && (
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              onPress={() => changeStatus("methods")}
              style={styles.buttonChange}
            >
              <Text style={styles.buttonChangeText}>Cambiar metodo</Text>
            </TouchableOpacity>
            {method === PaymentMethod.Transferencia && <BankTransfer />}
            {method === PaymentMethod.Tarjetas && <View id="pp-button"></View>}
          </View>
        )}

        <AdquisitionForm
          onSubmit={(eventDto) => handleFreeAcquisition(eventDto)}
          product={product}
          canBuyForOthers={canBuyForOthers}
          loading={loading}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 32,
  },
  container: {
    width: Platform.OS === "web" ? 600 : "100%",
    alignSelf: "center",
    padding: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 32,
    gap: 16,
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  paymentContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: Platform.OS === "web" ? 600 : "100%",
    alignSelf: "center",
    backgroundColor: colors.background.primary,
    padding: 16,
  },
  buttonChange: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: colors.brand.orange[500],
    borderColor: colors.brand.orange[500],
    width:"25%"
  },
  buttonChangeText: { color: "white", fontWeight: "600" },
});
