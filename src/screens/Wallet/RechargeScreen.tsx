import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useRecharge,
  PRESET_AMOUNTS,
  PAYMENT_METHODS,
} from "./hooks/useRecharge";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { useUserBalance } from "src/hooks/useUserBalance";
import { convertBeCoinsToUSD } from "src/constants/currency";

import { BeCoinsBalance, Button, WrapperModal } from "src/components";
import { notify } from "src/hooks/notification/notify.external";
import { CopyToClipboard } from "src/utils/shareHelper";
import { File } from "expo-file-system";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";

const BankDetailRow = ({ label, value, isCopyable = false }: any) => (
  <View className="flex-col sm:flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
    <Text className="text-gray-900 text-sm">{label}</Text>
    <View className="flex-row items-center gap-2">
      <Text className="text-gray-700 font-medium text-right text-xs md:text-sm  line-clamp-1">
        {value}
      </Text>
      {isCopyable && (
        <TouchableOpacity onPress={() => CopyToClipboard(value)}>
          <Ionicons name="copy-outline" size={14} color="#F97316" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function RechargeScreen() {
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
  } = useRecharge();

  return (
    <>
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
              <BeCoinsBalance
                size="medium"
                variant="header"
                style={{ marginLeft: "auto" }}
              />

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
                    {selectedPaymentMethod === "PAYPHONE" && (
                      <View className="flex-col md:flex-row justify-between mb-3">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          Comisión de terceros
                        </Text>
                        <View className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                          <Text className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            Te lo devolvemos en Orange Becoins (6%)
                          </Text>
                        </View>
                      </View>
                    )}

                    <View className="flex-row justify-between mb-3">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Comisión Beland
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
                    <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3 ">
                      <View className="flex flex-col md:flex-row w-full justify-center items-center gap-1">
                        <Text className="text-sm text-gray-700 dark:text-gray-300 text-center">
                          Recibirás
                        </Text>
                        <Text className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                          {selectedPaymentMethod === "PAYPHONE"
                            ? `${beCoinsAmount - beCoinsAmount * 0.06} BeCoins`
                            : `${beCoinsAmount} Becoins`}
                        </Text>

                        {selectedPaymentMethod === "PAYPHONE" && (
                          <>
                            <Text className="px-1 text-sm text-gray-700 dark:text-gray-300">
                              y
                            </Text>
                            <Text className="text-base font-bold text-orange-600 dark:text-orange-400">
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
                      <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        1 BeCoin = $0.05 USD
                      </Text>
                    </View>
                  </View>
                )}

                {/* Contenedor para el botón de Payphone en Web */}
                {Platform.OS === "web" &&
                  selectedPaymentMethod === "PAYPHONE" && (
                    <WrapperModal
                      header={
                        <Text className="text-xl font-semibold"> Payphone</Text>
                      }
                      isOpen={modalPayphone}
                      onClose={() => {
                        setModalPayphone(false);
                      }}
                      content={
                        <View className="mb-4">
                          <div id="pp-button"></div>
                        </View>
                      }
                    />
                  )}

                {/* Botón de Recargar */}
                {
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
                }

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
      <WrapperModal
        content={
          <ScrollView className="flex-1 px-6 pt-6">
            {/* Instrucciones */}
            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
              <View className="flex-row gap-2 mb-2">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="  font-bold flex-1">Pasos para recargar:</Text>
              </View>
              <Text className=" text-sm ml-7">
                1. Realiza la transferencia por el monto exacto de{" "}
                <Text className="font-bold">${usdAmount.toFixed(2)}</Text>. El
                exceso no sera tenido en cuenta por el sistema.
              </Text>
              <Text className=" text-sm ml-7 mt-1">
                2. Toma una captura o foto del comprobante.
              </Text>
              <Text className=" text-sm ml-7 mt-1">
                3. Sube la foto y escribe el número de referencia bancaria
                abajo.
              </Text>
            </View>
            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
              {/* Datos de la Cuenta */}
              {selectedPaymentAccount && (
                <View>
                  <Text className="text-sm font-semibold  uppercase tracking-wider mb-4">
                    Datos Bancarios
                  </Text>

                  <BankDetailRow
                    label="Banco"
                    value={selectedPaymentAccount.bank}
                  />
                  <BankDetailRow
                    label="Tipo de Cuenta"
                    value={selectedPaymentAccount.type_account}
                  />
                  <BankDetailRow
                    label="Número de Cuenta"
                    value={selectedPaymentAccount.nro_account}
                    isCopyable
                  />
                  <BankDetailRow
                    label="Beneficiario"
                    value={selectedPaymentAccount.accountHolder}
                  />
                  <BankDetailRow
                    label="C.I. / RUC"
                    value={selectedPaymentAccount.ruc}
                    isCopyable
                  />
                  <BankDetailRow
                    label="Correo"
                    value={selectedPaymentAccount.email}
                  />
                </View>
              )}
            </View>

            {/* Subir Comprobante */}
            <View className="mb-6">
              <Text className="text-base font-bold  my-3">
                Subir Comprobante
              </Text>
              <TouchableOpacity
                onPress={() => pickImage()}
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 items-center justify-center min-h-[150px]"
              >
                {image && previewUri ? (
                  <View className="items-center">
                    {/* Note: Image requires uri */}
                    {/* In Expo ImagePicker result structure: result.assets[0].uri */}
                    <Text className="text-green-600 font-bold mb-2">
                      Imagen seleccionada:
                    </Text>
                    <Image
                      source={{ uri: previewUri }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                    <Text className="text-xs text-center text-gray-500 mb-2">
                      {imageName}
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={40}
                      color="#22C55E"
                    />
                    <Text className="text-xs text-gray-900 mt-2">
                      Toque para cambiar
                    </Text>
                  </View>
                ) : (
                  <>
                    <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl  border-blue-100 dark:border-blue-800 mb-2 ">
                      <Ionicons
                        name="cloud-upload-outline"
                        size={24}
                        color="#F97316"
                      />
                    </View>
                    <Text className="text-gray-600 dark:text-gray-900 font-medium">
                      Subir foto del comprobante
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      JPG, PNG o PDF
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Número de Referencia */}
            <View className="mb-20">
              <Text className="text-base font-bold mb-3">
                Número de Referencia / Transacción Bancaria
              </Text>
              <TextInput
                value={referenceId}
                onChangeText={setReferenceId}
                placeholder="Ej: 12345678"
                placeholderTextColor="#9CA3AF"
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 py-3 text-gray-900 text-base"
              />
              <Text className="text-xs text-gray-500 mt-2 ml-1">
                Ingresa el número de confirmación que aparece en tu comprobante.
              </Text>
            </View>
          </ScrollView>
        }
        actions={
          <Button
            title={isLoading ? "Procesando..." : "Confirmar Transferencia"}
            onPress={handleBankTransferPayment}
            disabled={isLoading || !referenceId}
          />
        }
        isOpen={showBankTransferModal}
        header={
          <Text className="text-xl font-bold">Transferencia Bancaria</Text>
        }
        onClose={() => setShowBankTransferModal(false)}
      />
    </>
  );
}
