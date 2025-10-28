import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useAuth } from "src/context";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { colors } from "src/design-system";
import { usePaymentHandler } from "./hooks/usePaymentHandler";
import CompanyHeader from "./components/CompanyHeader";
import { FreeAcquisitionForm } from "./components/FreeAdquisitionForm";
import {
  PaymentMethod,
  PaymentMethodsSelector,
} from "./components/PaymentMehotdSelector";
import { BankTransfer } from "../Payment/components/BankTransfer";

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
  // TODO: Add a loading screen
  const { user } = useAuth();
  const [method, setMethod] = useState("Tarjetas");
  const [customAmount, setCustomAmount] = useState(
    total_amount?.toString() ?? ""
  );
  const isFree = !total_amount || total_amount === 0;
  const scrollRef = useRef<ScrollView>(null);
  // TODO: Add a login screen
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
      <ThemedHeader canGoBack />
      <ScrollView
        key={status}
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <CompanyHeader company={company} />

        {status === "methods" && (
          <View style={styles.container}>
            {isFree ? (
              <FreeAcquisitionForm
                product={product}
                canBuyForOthers={canBuyForOthers}
                onSubmit={() => handleFreeAcquisition(product.id)}
                loading={loading}
              />
            ) : (
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
                    amount: Number(customAmount || total_amount),
                  })
                }
                loading={loading}
              />
            )}
          </View>
        )}

        {Platform.OS === "web" && status === "payment" && (
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              onPress={() => changeStatus("methods")}
              style={styles.buttonChange}
            >
              <Text>Cambiar</Text>
            </TouchableOpacity>
            {method === PaymentMethod.Tarjetas && <View id="pp-button" />}
            {/* {method === PaymentMethod.BeCoins && <View id="pp-button" />} */}
            {method === PaymentMethod.Transferencia && <BankTransfer />}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingBottom: 32,
  },
  container: {
    width: Platform.OS === "web" ? 600 : "100%",
    alignSelf: "center",
    padding: 16,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxWidth: 80,
    alignItems: "center",
    borderRadius: 8,
  },
});
