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
import { useUserBalance } from "src/hooks";
import { useNavigation } from "@react-navigation/native";

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
  const navigation = useNavigation();
  const { params } = useRoute<PaymentScreenRouteProp>();
  const {
    product,
    company,
    total_amount = 0,
    canEditAmount,
    canBuyForOthers,
  } = params;
  const { user } = useAuth();
  const { balance } = useUserBalance();
  if (!user || !product.id) return null;

  const { loading, isFree, Form, setForm, handlePayment, canPurchase } =
    usePaymentHandler(user, total_amount, product.id, balance);

  return (
    <View style={styles.content}>
      <ThemedHeader
        title="Compra"
        canGoBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CompanyHeader company={company} total_amount={total_amount || 0} />
        {isFree && (
          <View style={styles.container}>
            <Text>
              Esta entrada es gratuita, recuerda llevar tu reciclable o deberas
              abonar Usd $5
            </Text>
          </View>
        )}
        <AdquisitionForm
          canBuyForOthers={canBuyForOthers}
          loading={loading}
          Form={Form}
          setForm={setForm}
          canPurchase={canPurchase}
          onSubmit={() => handlePayment()}
        />
        {/* {status === "methods" && !isFree && (
          <PaymentMethodsSelector
            method={method}
            onSelect={setMethod}
            canEditAmount={canEditAmount}
            customAmount={customAmount}
            onChangeAmount={setCustomAmount}
            onConfirm={() => handleAdquisition()}
            loading={loading}
          />
        )} */}
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
    width: "90%",
    maxWidth: 600,
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
    width: "90%",
    maxWidth: 600,
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
    maxWidth: 150,
  },
  buttonChangeText: { color: "white", fontWeight: "600", textAlign: "center" },
});
