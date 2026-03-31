import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecharge, PRESET_AMOUNTS } from "./hooks/useRecharge";
import { ThemedHeader } from "src/components/shared/headers/Header";

import { Button } from "src/components";
import { notify } from "src/hooks/notification/notify.external";
import { useCustomNavigation } from "src/hooks";
import BankTransferModal from "./modal/bankTransfer.modal";
import SelectorPayment from "./components/SelectorPayment";

export default function RechargeScreen() {
  const { navigate } = useCustomNavigation();

  const {
    amount,
    selectedPaymentMethod,
    isLoading,
    beCoinsAmount,
    usdAmount,
    previewUri,
    imageName,
    totalAmount,
    isValid,
    handleAmountChange,
    handlePresetAmount,
    handlePaymentMethodSelect,
    handleProceedToPayment,
    handleBankTransferPayment,
    referenceId,
    setReferenceId,
    image,
    pickImage,
    showBankTransferModal,
    setShowBankTransferModal,
    selectedPaymentAccount,
    tabs,
    onTabChange,
    modalPayphone,
    setModalPayphone,
    destroyPayphoneWidget,
  } = useRecharge();

  return (
    <>
      <ThemedHeader
        title="Recargar BeCoins"
        canGoBack
        onBackPress={() => navigate("MainTabs", { screen: "Wallet" })}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-8 px-4">
          {/* Card Principal */}
          <View className="bg-white rounded-3xl shadow-lg border border-gray-200 ">
            <View className="p-8">
              <View className="mb-12">
                <View className="flex-row items-center">
                  <Text className="text-3xl text-gray-400 font-light">
                    USD$
                  </Text>
                  <TextInput
                    id="amount"
                    className=" text-7xl font-bold text-gray-900 ml-3"
                    placeholder="0.00"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={handleAmountChange}
                  />
                </View>
              </View>
              {/* Montos Rápidos */}
              <View>
                <Text className="font-semibold text-gray-800 uppercase tracking-wider mb-4">
                  Montos Predefinidos:
                </Text>
                <View className="md:flex-row gap-3">
                  {PRESET_AMOUNTS.map((presetAmount) => (
                    <TouchableOpacity
                      key={presetAmount}
                      onPress={() => handlePresetAmount(presetAmount)}
                      className={`flex-1 py-10 rounded-xl border ${
                        amount === presetAmount.toString()
                          ? "bg-orange-500 border-orange-500 shadow-lg"
                          : "border-orange-200  active:border-orange-500"
                      }`}
                    >
                      <Text
                        className={`text-center text-base font-medium ${
                          amount === presetAmount.toString()
                            ? "text-white font-semibold"
                            : "text-gray-800"
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
            <View className="p-8">
              <Text className="text-lg font-bold text-gray-900 mb-6">
                Métodos de pago
              </Text>

              {/* Lista de Métodos de Pago */}
              <SelectorPayment
                handlePaymentMethodSelect={handlePaymentMethodSelect}
                selectedPaymentMethod={selectedPaymentMethod}
              />
              {/* Resumen y Botón */}
              <View className="mt-8 pt-8 ">
                {/* Resumen de la Orden */}
                {amount && Number(amount) > 0 && (
                  <View className="bg-gray-100  rounded-2xl p-5 mb-6">
                    <Text className="text-base font-bold text-gray-900  mb-4">
                      Resumen de la orden
                    </Text>

                    {/* Monto de recarga */}
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-sm text-gray-600 ">
                        Monto de recarga
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900 ">
                        ${usdAmount.toFixed(2)} USD
                      </Text>
                    </View>

                    {/* Comisión */}
                    {selectedPaymentMethod === "PAYPHONE" && (
                      <View className="flex-col md:flex-row justify-between mb-3">
                        <Text className="text-sm text-gray-600 ">
                          Comisión de terceros
                        </Text>
                        <View className="bg-green-50  px-2 py-1 rounded-md">
                          <Text className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            Te lo devolvemos en Orange Becoins (6%)
                          </Text>
                        </View>
                      </View>
                    )}

                    <View className="flex-row justify-between mb-3">
                      <Text className="text-sm text-gray-600 ">
                        Comisión Beland
                      </Text>
                      <View className="bg-green-50  px-2 py-1 rounded-md">
                        <Text className="text-sm font-bold text-green-600 ">
                          Gratis (0%)
                        </Text>
                      </View>
                    </View>

                    {/* Divisor */}
                    <View className="h-px bg-gray-200 my-3" />

                    {/* Total */}
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-base font-bold text-gray-900 ">
                        Total
                      </Text>
                      <Text className="text-lg font-bold text-orange-500">
                        ${totalAmount.toFixed(2)} USD
                      </Text>
                    </View>

                    {/* BeCoins a recibir */}
                    <View className="bg-blue-50 border-blue-200 rounded-xl p-3 ">
                      <View className="flex flex-col md:flex-row w-full justify-center items-center gap-1">
                        <Text className="text-sm text-gray-700 text-center">
                          Recibirás
                        </Text>
                        <Text className="text-base font-bold text-yellow-600 ">
                          {selectedPaymentMethod === "PAYPHONE"
                            ? `${beCoinsAmount - beCoinsAmount * 0.06} BeCoins`
                            : `${beCoinsAmount} Becoins`}
                        </Text>

                        {selectedPaymentMethod === "PAYPHONE" && (
                          <>
                            <Text className="px-1 text-sm text-gray-700">
                              y
                            </Text>
                            <Text className="text-base font-bold text-orange-600">
                              {beCoinsAmount * 0.06} Orange Becoins
                            </Text>
                            <Ionicons
                              name="information-circle"
                              size={20}
                              color="gray"
                              onPress={() =>
                                notify.info({
                                  message:
                                    "Absorvemos la comision bancaria y te la devolvemos como Orange BeCoins",
                                })
                              }
                            />
                          </>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500 text-center mt-1">
                        1 BeCoin = $0.05 USD
                      </Text>
                    </View>
                  </View>
                )}

                {/* Contenedor para el botón de Payphone en Web */}
                {Platform.OS === "web" &&
                  selectedPaymentMethod === "PAYPHONE" &&
                  modalPayphone && (
                    <View className="mb-4 flex gap-2">
                      <Button
                        onPress={() => {
                          destroyPayphoneWidget();
                          setModalPayphone(false);
                        }}
                        title="Cancelar"
                        variant="secondary"
                      />
                      <div id="pp-button"></div>
                    </View>
                  )}

                {/* Botón de Recargar */}
                {!modalPayphone && (
                  <TouchableOpacity
                    disabled={!isValid}
                    onPress={handleProceedToPayment}
                    className={`w-full py-4 px-6 rounded-xl items-center mb-4 ${
                      isValid
                        ? "bg-orange-500 active:bg-orange-600 shadow-lg"
                        : "bg-gray-300 "
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`font-bold text-lg ${
                          isValid ? "text-white" : "text-gray-600 "
                        }`}
                      >
                        {selectedPaymentMethod === "BANK_TRANSFER"
                          ? "Ver datos de cuenta"
                          : "Recargar ahora"}
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
        </View>
      </ScrollView>
      {/* MODAL DE TRANSFERENCIA BANCARIA */}
      <BankTransferModal
        handleBankTransferPayment={handleBankTransferPayment}
        image={image}
        imageName={imageName}
        isLoading={isLoading}
        onTabChange={onTabChange}
        tabs={tabs}
        pickImage={pickImage}
        previewUri={previewUri}
        referenceId={referenceId}
        setReferenceId={setReferenceId}
        selectedPaymentAccount={selectedPaymentAccount}
        setShowBankTransferModal={setShowBankTransferModal}
        showBankTransferModal={showBankTransferModal}
        usdAmount={usdAmount}
      />
    </>
  );
}
