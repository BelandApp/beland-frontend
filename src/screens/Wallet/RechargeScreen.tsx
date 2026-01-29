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
import { convertBeCoinsToUSD, formatUSDPrice } from "src/constants/currency";

import * as ImagePicker from "expo-image-picker";
import { Modal, Alert } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "src/components";
import { notify } from "src/hooks/notification/notify.external";

// ... existing imports ...

// Helper component for Bank Details row
const BankDetailRow = ({ label, value, isCopyable = false }: any) => (
  <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
    <Text className="text-gray-500 dark:text-gray-400 text-sm">{label}</Text>
    <View className="flex-row items-center gap-2">
      <Text className="text-gray-900 dark:text-white font-medium text-right text-sm max-w-[200px]">
        {value}
      </Text>
      {isCopyable && (
        <TouchableOpacity>
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
    processingFee,
    totalAmount,
    isValid,
    handleAmountChange,
    handlePresetAmount,
    handlePaymentMethodSelect,
    handleProceedToPayment,
    handleBankTransferPayment,
    // Bank Transfer Props
    referenceId,
    setReferenceId,
    proofImage,
    setProofImage,
    showBankTransferModal,
    setShowBankTransferModal,
    paymentAccounts,
  } = useRecharge();

  const { balance: beCoinsBalance, loading: balanceLoading } = useUserBalance();
  const usdBalance = convertBeCoinsToUSD(beCoinsBalance || 0);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 6],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProofImage(result.assets[0]);
      }
      console.log(result);
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir la galería.");
    }
  };

  // Find the account to display (e.g. Banco Guayaquil or first available)
  // Hardcoding fallback as requested by user if API returns nothing or specific account overrides
  const selectedAccount =
    paymentAccounts.find((acc) =>
      acc.bank_name?.toLowerCase().includes("guayaquil"),
    ) || paymentAccounts[0];

  // Use user provided hardcoded details if API is empty or as default display
  const displayAccount = {
    bankName: selectedAccount?.bank_name || "Banco Guayaquil",
    accountNumber: selectedAccount?.account_number || "0005889133",
    accountType: selectedAccount?.account_type || "Ahorro",
    beneficiary: selectedAccount?.alias || "Vargas Reyes Diego Vicente",
    email: selectedAccount?.email || "DIEGOVARGASREYES@GMAIL.COM",
    identification: selectedAccount?.identification || "1705919668",
  };

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
                        Comisión de terceros
                      </Text>
                      <View className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        <Text className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          Te lo devolvemos en Orange Becoins (6%)
                        </Text>
                      </View>
                    </View>

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
                    <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3">
                      <View className="flex flex-row w-full justify-center items-center">
                        <Text className="text-sm text-gray-700 dark:text-gray-300 text-center">
                          Recibirás
                        </Text>
                        <Text className="text-base font-bold text-green-600 dark:text-green-400">
                          {beCoinsAmount - beCoinsAmount * 0.06} BeCoins
                        </Text>
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
      <Modal
        visible={showBankTransferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBankTransferModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl h-[95%] w-full flex overflow-hidden">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-row justify-between items-center bg-gray-50 dark:bg-gray-800">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Transferencia Bancaria
              </Text>
              <TouchableOpacity
                onPress={() => setShowBankTransferModal(false)}
                className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full"
              >
                <Ionicons name="close" size={20} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
              {/* Instrucciones */}
              <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                <View className="flex-row gap-2 mb-2">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#3B82F6"
                  />
                  <Text className="text-blue-800 dark:text-blue-300 font-bold flex-1">
                    Pasos para recargar:
                  </Text>
                </View>
                <Text className="text-blue-700 dark:text-blue-200 text-sm ml-7">
                  1. Realiza la transferencia por el monto exacto de{" "}
                  <Text className="font-bold">${usdAmount.toFixed(2)}</Text>.
                </Text>
                <Text className="text-blue-700 dark:text-blue-200 text-sm ml-7 mt-1">
                  2. Toma una captura o foto del comprobante.
                </Text>
                <Text className="text-blue-700 dark:text-blue-200 text-sm ml-7 mt-1">
                  3. Sube la foto y escribe el número de referencia abajo.
                </Text>
              </View>

              {/* Datos de la Cuenta */}
              <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 shadow-sm">
                <Text className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                  Datos Bancarios
                </Text>

                <BankDetailRow label="Banco" value={displayAccount.bankName} />
                <BankDetailRow
                  label="Tipo de Cuenta"
                  value={displayAccount.accountType}
                />
                <BankDetailRow
                  label="Número de Cuenta"
                  value={displayAccount.accountNumber}
                  isCopyable
                />
                <BankDetailRow
                  label="Beneficiario"
                  value={displayAccount.beneficiary}
                />
                <BankDetailRow
                  label="C.I. / RUC"
                  value={displayAccount.identification}
                />
                <BankDetailRow label="Correo" value={displayAccount.email} />
              </View>

              {/* Subir Comprobante */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  Subir Comprobante
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 items-center justify-center min-h-[150px]"
                >
                  {proofImage ? (
                    <View className="items-center">
                      {/* Note: Image requires uri */}
                      {/* In Expo ImagePicker result structure: result.assets[0].uri */}
                      <Text className="text-green-600 font-bold mb-2">
                        ¡Imagen seleccionada!
                      </Text>
                      <Image
                        source={proofImage}
                        width={100}
                        height={100}
                        style={{
                          maxWidth: 100,
                          maxHeight: 100,
                          borderRadius: 8,
                          objectFit: "cover",
                        }}
                      />
                      <Text className="text-xs text-center text-gray-500 mb-2">
                        {proofImage.fileName}
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={40}
                        color="#22C55E"
                      />
                      <Text className="text-xs text-blue-500 mt-2">
                        Toque para cambiar
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View className="bg-white dark:bg-gray-700 p-3 rounded-full mb-2 shadow-sm">
                        <Ionicons
                          name="cloud-upload-outline"
                          size={24}
                          color="#F97316"
                        />
                      </View>
                      <Text className="text-gray-600 dark:text-gray-300 font-medium">
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
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  Número de Referencia
                </Text>
                <TextInput
                  value={referenceId}
                  onChangeText={setReferenceId}
                  placeholder="Ej: 12345678"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
                />
                <Text className="text-xs text-gray-500 mt-2 ml-1">
                  Ingresa el número de confirmación que aparece en tu
                  comprobante.
                </Text>
              </View>
            </ScrollView>

            {/* Footer Button */}
            <View className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 absolute bottom-0 w-full">
              <TouchableOpacity
                onPress={handleBankTransferPayment}
                disabled={isLoading || !referenceId}
                className={`nav-button w-full py-4 rounded-xl items-center shadow-lg ${
                  isLoading || !referenceId
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-orange-500 active:bg-orange-600"
                }`}
              >
                {isLoading ? (
                  <Text className="text-white font-bold">Procesando...</Text>
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Confirmar Transferencia
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Toast config={toastConfig} />
      </Modal>
    </>
  );
}
