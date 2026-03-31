import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { PAYMENT_METHODS, PaymentMethodId } from "../hooks/useRecharge";
import { Ionicons } from "@expo/vector-icons";
import { PaymentAccount } from "src/services";
type SelectorPaymentType = {
  handlePaymentMethodSelect: (methodId: PaymentMethodId) => void;
  selectedPaymentMethod: PaymentMethodId | null;
};
const SelectorPayment: React.FC<SelectorPaymentType> = ({
  handlePaymentMethodSelect,
  selectedPaymentMethod,
}) => {
  return (
    <View>
      {PAYMENT_METHODS.map((method, index) => (
        <TouchableOpacity
          key={method.id}
          onPress={() => handlePaymentMethodSelect(method.id)}
          className={`flex-row items-center p-4 rounded-xl ${
            index < PAYMENT_METHODS.length - 1 ? "mb-4" : ""
          } ${
            selectedPaymentMethod === method.id
              ? "border-2 border-orange-500 bg-white  shadow-md"
              : "border border-gray-200  bg-white "
          }`}
        >
          <View
            className={`w-12 h-12 rounded-full ${
              selectedPaymentMethod === method.id
                ? "bg-orange-50 "
                : "bg-gray-100 "
            } items-center justify-center mr-4`}
          >
            <Ionicons
              name={method.icon as any}
              size={24}
              color={
                selectedPaymentMethod === method.id ? "#F97316" : "#9CA3AF"
              }
            />
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-0.5">
              <Text className="text-sm font-bold text-gray-900 ">
                {method.name}
              </Text>
              {method.badge && (
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    method.badgeColor === "green" && "bg-green-100 "
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      method.badgeColor === "green"
                        ? "text-green-700 "
                        : "text-gray-600 "
                    }`}
                  >
                    {method.badge}
                  </Text>
                </View>
              )}
            </View>
            {method.description && (
              <Text className="text-xs text-gray-500 ">
                {method.description}
              </Text>
            )}
          </View>
          <View
            className={`w-5 h-5 rounded-full ${
              selectedPaymentMethod === method.id
                ? "bg-orange-500 border-2 border-orange-500"
                : "border-2 border-gray-300 "
            } items-center justify-center ml-2`}
          >
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark" size={10} color="white" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SelectorPayment;
