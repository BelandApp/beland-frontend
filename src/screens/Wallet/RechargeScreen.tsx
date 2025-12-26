import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useRecharge,
  PRESET_AMOUNTS,
  PAYMENT_METHODS,
} from "./hooks/useRecharge";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { useUserBalance } from "src/hooks/useUserBalance";
import { convertBeCoinsToUSD, formatUSDPrice } from "src/constants/currency";

export default function RechargeScreen() {
  const {
    amount,
    selectedPaymentMethod,
    isLoading,
    beCoinsAmount,
    usdAmount,
    processingFee,
    totalAmount,
    isValid,
    handleAmountChange,
    handlePresetAmount,
    handlePaymentMethodSelect,
    handleProceedToPayment,
  } = useRecharge();

  const { balance: beCoinsBalance, loading: balanceLoading } = useUserBalance();

  const usdBalance = convertBeCoinsToUSD(beCoinsBalance || 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ThemedHeader title="Recargar BeCoins" canGoBack />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-8 px-4">
          {/* Card Principal */}
          <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Sección de Monto */}
            <View
              className="p-8 border-b border-gray-200 dark:border-gray-700"
              style={{ position: "relative" }}
            >
              {/* Header con Saldo: pill centrado encima en móvil, alineado a la derecha en escritorio */}
              <View className="mb-6 relative">
                {/* Pill: absolute centered on small screens, static on md */}
                <View className="absolute left-1/2 -translate-x-1/2 -top-2 md:static md:left-auto md:translate-x-0 md:top-0 md:self-end">
                  <View className="bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-xl flex-row items-center gap-2 border border-orange-100 dark:border-orange-800/30 max-w-[170px] shadow-sm">
                    <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center flex-shrink-0">
                      <Ionicons name="wallet" size={16} color="white" />
                    </View>
                    <View className="flex-shrink flex-wrap items-center md:items-start text-center md:text-left">
                      <Text className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        Saldo actual
                      </Text>
                      <Text className="text-xs font-bold text-gray-900 dark:text-white">
                        {balanceLoading
                          ? "—"
                          : `$${formatUSDPrice(usdBalance)}`}
                      </Text>
                      {!balanceLoading && (
                        <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                          {Math.floor(beCoinsBalance || 0)} BeCoins
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Título y subtítulo: padding top to avoid overlap on small screens */}
                <View className="pt-12 md:pt-0">
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center md:text-left">
                    Ingresa el monto
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                    Selecciona o escribe la cantidad a recargar
                  </Text>
                </View>
              </View>

              {/* Input de Monto */}
              <View className="mb-12">
                <View className="flex-row items-center">
                  <Text className="text-5xl text-gray-400 dark:text-gray-500 font-light">
                    $
                  </Text>
                  <TextInput
                    className="flex-1 text-7xl font-bold text-gray-900 dark:text-white ml-3"
                    placeholder="0.00"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={handleAmountChange}
                  />
                  <View className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-gray-50 dark:bg-gray-700">
                    <Text className="text-sm font-bold text-gray-400 dark:text-gray-500">
                      USD
                    </Text>
                  </View>
                </View>
              </View>

              {/* Montos Rápidos */}
              <View>
                <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                  Montos rápidos
                </Text>
                <View className="flex-row gap-3">
                  {PRESET_AMOUNTS.map((presetAmount) => (
                    <TouchableOpacity
                      key={presetAmount}
                      onPress={() => handlePresetAmount(presetAmount)}
                      className={`flex-1 py-3 rounded-xl border ${
                        amount === presetAmount.toString()
                          ? "bg-orange-500 border-orange-500 shadow-lg"
                          : "border-gray-200 dark:border-gray-700 active:border-orange-500"
                      }`}
                    >
                      <Text
                        className={`text-center text-base font-medium ${
                          amount === presetAmount.toString()
                            ? "text-white font-semibold"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        ${presetAmount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Sección de Método de Pago */}
            <View className="p-8 bg-gray-50/50 dark:bg-gray-800/20">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Método de pago
              </Text>

              {/* Lista de Métodos de Pago */}
              {PAYMENT_METHODS.map((method, index) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => handlePaymentMethodSelect(method.id)}
                  className={`flex-row items-center p-4 rounded-xl ${
                    index < PAYMENT_METHODS.length - 1 ? "mb-4" : ""
                  } ${
                    selectedPaymentMethod === method.id
                      ? "border-2 border-orange-500 bg-white dark:bg-gray-800 shadow-md"
                      : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-full ${
                      selectedPaymentMethod === method.id
                        ? "bg-orange-50 dark:bg-gray-700"
                        : "bg-gray-100 dark:bg-gray-700"
                    } items-center justify-center mr-4`}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={24}
                      color={
                        selectedPaymentMethod === method.id
                          ? "#F97316"
                          : "#9CA3AF"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-0.5">
                      <Text className="text-sm font-bold text-gray-900 dark:text-white">
                        {method.name}
                      </Text>
                      {method.badge && (
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            method.badgeColor === "green"
                              ? "bg-green-100 dark:bg-green-900/40"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              method.badgeColor === "green"
                                ? "text-green-700 dark:text-green-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {method.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    {method.description && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {method.description}
                      </Text>
                    )}
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full ${
                      selectedPaymentMethod === method.id
                        ? "bg-orange-500 border-2 border-orange-500"
                        : "border-2 border-gray-300 dark:border-gray-500"
                    } items-center justify-center ml-2`}
                  >
                    {selectedPaymentMethod === method.id && (
                      <Ionicons name="checkmark" size={10} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Resumen y Botón */}
              <View className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                {/* Resumen de la Orden */}
                {amount && Number(amount) > 0 && (
                  <View className="bg-gray-100 dark:bg-gray-900/30 rounded-2xl p-5 mb-6">
                    <Text className="text-base font-bold text-gray-900 dark:text-white mb-4">
                      Resumen de la orden
                    </Text>

                    {/* Monto de recarga */}
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Monto de recarga
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${usdAmount.toFixed(2)} USD
                      </Text>
                    </View>

                    {/* Comisión */}
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Comisión
                      </Text>
                      <View className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        <Text className="text-sm font-bold text-green-600 dark:text-green-400">
                          Gratis (0%)
                        </Text>
                      </View>
                    </View>

                    {/* Divisor */}
                    <View className="h-px bg-gray-200 dark:border-gray-700 my-3" />

                    {/* Total */}
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-base font-bold text-gray-900 dark:text-white">
                        Total
                      </Text>
                      <Text className="text-lg font-bold text-orange-500">
                        ${totalAmount.toFixed(2)} USD
                      </Text>
                    </View>

                    {/* BeCoins a recibir */}
                    <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3">
                      <Text className="text-sm text-gray-700 dark:text-gray-300 text-center">
                        Recibirás{" "}
                        <Text className="text-base font-bold text-green-600 dark:text-green-400">
                          {beCoinsAmount.toLocaleString()} BeCoins
                        </Text>
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        1 BeCoin = $0.05 USD
                      </Text>
                    </View>
                  </View>
                )}

                {/* Contenedor para el botón de Payphone en Web */}
                {Platform.OS === "web" &&
                  selectedPaymentMethod === "PAYPHONE" && (
                    <View className="mb-4">
                      <div id="pp-button"></div>
                    </View>
                  )}

                {/* Botón de Recargar */}
                {!isLoading && (
                  <TouchableOpacity
                    disabled={!isValid}
                    onPress={handleProceedToPayment}
                    className={`w-full py-4 px-6 rounded-xl items-center mb-4 ${
                      isValid
                        ? "bg-orange-500 active:bg-orange-600 shadow-lg"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`font-bold text-lg ${
                          isValid
                            ? "text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        Recargar ahora
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={24}
                        color={isValid ? "white" : "#9CA3AF"}
                      />
                    </View>
                  </TouchableOpacity>
                )}

                {/* Texto de seguridad */}
                <View className="flex-row justify-center items-center gap-2">
                  <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Pagos procesados de forma segura y encriptada
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Nota informativa */}
          {/* <View className="flex-row gap-3 justify-center mt-8 px-4">
            <Ionicons name="information-circle" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center flex-1 max-w-lg">
              Los límites de recarga pueden variar según tu nivel de
              verificación. Para montos superiores a $5,000 USD, por favor
              utiliza transferencia bancaria internacional.
            </Text>
          </View> */}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="py-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <Text className="text-xs text-gray-400 dark:text-gray-600 text-center">
          © 2025 Beland Develop. Todos los derechos reservados.
        </Text>
      </View>
    </SafeAreaView>
  );
}
