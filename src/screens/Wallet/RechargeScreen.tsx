import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  useRecharge,
  PAYMENT_METHODS,
  cardBrandStyles,
} from "./hooks/useRecharge";
import { ThemedHeader } from "src/components/shared/headers/Header";

import { Button, WrapperModal } from "src/components";
import { notify } from "src/hooks/notification/notify.external";
import { useCustomNavigation } from "src/hooks";
import { CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "src/context";
import { CopyToClipboard } from "src/utils/shareHelper";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";

const BankDetailRow = ({ label, value, isCopyable = false }: any) => (
  <View className="flex-col sm:flex-row justify-between py-2 border-b border-gray-100">
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
// para validacion
const stripeKey = process.env.EXPO_PUBLIC_STRIPE_KEY;
export const RechargeScreen = ({ route }: { route: any }) => {
  const paramsAmount = route.params?.paramsAmount;
  const { navigate } = useCustomNavigation();
  const { user } = useAuth();
  const {
    amount,
    selectedPaymentMethod,
    isLoading,
    beCoinsAmount,
    usdAmount,
    previewUri,
    imageName,
    isValid,
    PRESET_AMOUNTS,
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
    setModalStripe,
    modalStripe,
    handlePay,
    cardBrand,
    setCardBrand,
  } = useRecharge({ paramsAmount });
  const brand = cardBrandStyles[cardBrand ?? "unknown"];
  const handleBeforeClose = () => {
    return new Promise<boolean>((resolve) => {
      notify.confirm({
        message: "¿Seguro que quieres salir? Perderás tu progreso",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  return (
    <>
      <ThemedHeader
        title="Recargar BeCoins"
        canGoBack
        onBackPress={() => {
          setTimeout(() => {
            navigate("MainTabs", { screen: "Wallet" });
          }, 0);
        }}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-8 px-4">
          {/* Card Principal */}
          <View className="bg-white  rounded-3xl shadow-lg border border-gray-200  overflow-hidden">
            {/* Sección de Monto */}
            <View
              className="p-8 border-b border-gray-200"
              style={{ position: "relative" }}
            >
              {/* Montos Rápidos */}
              <View>
                <Text className="font-semibold text-gray-800 uppercase tracking-wider mb-4">
                  {paramsAmount === undefined
                    ? "Montos Predefinidos:"
                    : "Monto de recarga:"}
                </Text>
                <View className="md:flex-row gap-3">
                  {PRESET_AMOUNTS.map((presetAmount) => (
                    <TouchableOpacity
                      key={presetAmount}
                      onPress={() => handlePresetAmount(presetAmount)}
                      className={`flex-1 py-10 rounded-xl border ${
                        amount === presetAmount
                          ? "bg-orange-500 border-orange-500 shadow-lg"
                          : "border-orange-200  active:border-orange-500"
                      }`}
                    >
                      <Text
                        className={`text-center text-base font-medium ${
                          amount === presetAmount
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
            <View className="p-8 ">
              <Text className="text-lg font-bold text-gray-900 mb-6">
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
                      ? "border-2 border-orange-500 bg-white shadow-md"
                      : "border border-gray-200  bg-white"
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-full ${
                      selectedPaymentMethod === method.id
                        ? "bg-orange-50"
                        : "bg-gray-100"
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
                      <Text className="text-sm font-bold text-gray-900">
                        {method.name}
                      </Text>
                      {method.badge && (
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            method.badgeColor === "green"
                              ? "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              method.badgeColor === "green"
                                ? "text-green-700"
                                : "text-gray-600"
                            }`}
                          >
                            {method.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    {method.description && (
                      <Text className="text-xs text-gray-500">
                        {method.description}
                      </Text>
                    )}
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full ${
                      selectedPaymentMethod === method.id
                        ? "bg-orange-500 border-2 border-orange-500"
                        : "border-2 border-gray-300"
                    } items-center justify-center ml-2`}
                  >
                    {selectedPaymentMethod === method.id && (
                      <Ionicons name="checkmark" size={10} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Resumen y Botón */}
              <View className="mt-8 pt-8 border-t border-gray-200">
                {/* Resumen de la Orden */}
                {amount && Number(amount) > 0 && (
                  <View className="bg-gray-100 rounded-2xl p-5 mb-6">
                    <Text className="text-base font-bold text-gray-900 mb-4">
                      Resumen de la orden
                    </Text>

                    {/* Monto de recarga */}
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-sm text-gray-600">
                        Monto de recarga
                      </Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        ${usdAmount.toFixed(2)} USD
                      </Text>
                    </View>

                    <View className="flex-row justify-between mb-3">
                      <Text className="text-sm text-gray-600">
                        Comisión Beland
                      </Text>
                      <View className="bg-green-50 px-2 py-1 rounded-md">
                        <Text className="text-sm font-bold text-green-600">
                          Gratis (0%)
                        </Text>
                      </View>
                    </View>

                    {/* Divisor */}
                    <View className="h-px bg-gray-200 my-3" />

                    {/* Total */}
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-base font-bold text-gray-900">
                        Total
                      </Text>
                      <Text className="text-lg font-bold text-orange-500">
                        ${usdAmount.toFixed(2)} USD
                      </Text>
                    </View>

                    {/* BeCoins a recibir */}
                    <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 ">
                      <View className="flex flex-col md:flex-row w-full justify-center items-center gap-1">
                        <Text className="text-sm text-gray-700 text-center">
                          Recibirás
                        </Text>
                        <Text className="text-base font-bold text-beland-orange-500">
                          ${beCoinsAmount} Becoins
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500 text-center mt-1">
                        1 BeCoin = $0.05 USD
                      </Text>
                    </View>
                  </View>
                )}

                {/* Botón de Recargar */}

                <TouchableOpacity
                  disabled={!isValid}
                  onPress={handleProceedToPayment}
                  className={`w-full py-4 px-6 rounded-xl items-center mb-4 ${
                    isValid
                      ? "bg-orange-500 active:bg-orange-600 shadow-lg"
                      : "bg-gray-300"
                  }`}
                >
                  <View className="flex-row items-center gap-2">
                    <Text
                      className={`font-bold text-lg ${
                        isValid ? "text-white" : "text-gray-500"
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

                {/* Texto de seguridad */}
                <View className="flex-row justify-center items-center gap-2">
                  <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                  <Text className="text-xs text-gray-400">
                    Pagos procesados de forma segura y encriptada
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE STRIPE */}
      {
        <WrapperModal
          beforeClose={handleBeforeClose}
          isOpen={modalStripe}
          onClose={() => setModalStripe(false)}
          header={
            <Text className="text-lg font-semibold">Pago mediante Stripe</Text>
          }
          actions={<Button title="Pagar" onPress={handlePay} />}
          content={
            <View className="gap-4">
              <Text className="text-lg ">
                Introduce los datos de tu tarjeta:
              </Text>
              <View
                className=" shadow-xl min-h-20 justify-center p-2 gap-4"
                style={{
                  backgroundColor: brand.color,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text className="text-lg font-semibold text-white capitalize">
                  {brand.label}
                </Text>
                <View className="bg-white p-2 rounded-lg">
                  {stripeKey ? (
                    <CardElement
                      onChange={(event) => {
                        setCardBrand(event.brand);
                      }}
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                          },
                        },
                      }}
                      onLoadError={() => {
                        notify.error({
                          message: "Error cargando Stripe, intenta nuevamente",
                        });
                      }}
                    />
                  ) : (
                    <Text className="text-lg text-red-400">
                      Error cargando stripe, contacte con el administrador
                    </Text>
                  )}
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white">{user?.full_name}</Text>

                  {cardBrand != "unknown" && cardBrand ? (
                    <FontAwesome
                      name={`cc-${cardBrand}` as any}
                      size={22}
                      color={"white"}
                    />
                  ) : (
                    <FontAwesome name="credit-card" size={22} color={"white"} />
                  )}
                </View>
              </View>
            </View>
          }
        />
      }
      {/* MODAL DE TRANSFERENCIA BANCARIA */}
      <WrapperModal
        beforeClose={handleBeforeClose}
        content={
          <View>
            {/* Instrucciones */}
            <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
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
            <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
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
                className="bg-blue-50 p-4 rounded-xl border border-blue-100 items-center justify-center min-h-[150px]"
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
                    <View className="bg-blue-50 p-4 rounded-xl  border-blue-100 mb-2 ">
                      <Ionicons
                        name="cloud-upload-outline"
                        size={24}
                        color="#F97316"
                      />
                    </View>
                    <Text className="text-gray-600 font-medium">
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
                className="bg-blue-50 p-4 rounded-xl border border-blue-100 py-3 text-gray-900 text-base"
              />
              <Text className="text-xs text-gray-500 mt-2 ml-1">
                Ingresa el número de confirmación que aparece en tu comprobante.
              </Text>
            </View>
          </View>
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
};

export default RechargeScreen;
