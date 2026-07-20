import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Button, WrapperModal } from "src/components";
import { notify } from "src/hooks/notification/notify.external";

import { Ionicons } from "@expo/vector-icons";
import ThemedTabs, { TabItem } from "src/components/shared/Tabs/ThemedTabs";
import { CopyToClipboard } from "src/utils/shareHelper";
import { TextInput } from "react-native-gesture-handler";
import { PaymentAccount } from "../hooks/useRecharge";
import { UploadImage } from "src/hooks";
type bankTransferModalType = {
  usdAmount: number;
  tabs: TabItem[];
  onTabChange: (tabLabel: string) => void;
  selectedPaymentAccount: PaymentAccount | undefined;
  pickImage: () => void;
  previewUri: string | null;
  image: UploadImage | null;
  referenceId: string;
  setReferenceId: React.Dispatch<React.SetStateAction<string>>;
  imageName: string;
  isLoading: boolean;
  handleBankTransferPayment: () => void;
  showBankTransferModal: boolean;
  setShowBankTransferModal: React.Dispatch<React.SetStateAction<boolean>>;
};
const BankTransferModal: React.FC<bankTransferModalType> = ({
  usdAmount,
  tabs,
  onTabChange,
  selectedPaymentAccount,
  pickImage,
  previewUri,
  image,
  referenceId,
  setReferenceId,
  imageName,
  isLoading,
  handleBankTransferPayment,
  showBankTransferModal,
  setShowBankTransferModal,
}) => {
  const isImagen = imageName.length > 0;
  const handleBeforeClose = () => {
    return new Promise<boolean>((resolve) => {
      notify.confirm({
        message: "¿Seguro que quieres salir? Perderás tu progreso",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };
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
  return (
    <WrapperModal
      beforeClose={handleBeforeClose}
      content={
        <View>
          {/* Instrucciones */}
          <View className="bg-orange-50  p-4 rounded-xl border border-orange-100 mb-6">
            <View className="flex-row gap-2 mb-2">
              <Ionicons name="information-circle" size={20} color="#f97316" />
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
              3. Sube la foto y escribe el número de referencia bancaria abajo.
            </Text>
          </View>
          <View className="bg-orange-50 p-4 rounded-xl border border-orange-100">
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
            <Text className="text-base font-bold  my-3">Subir Comprobante</Text>
            <TouchableOpacity
              onPress={() => pickImage()}
              className="bg-orange-50 p-4 rounded-xl border border-orange-100 items-center justify-center min-h-[150px]"
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
                  <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
                  <Text className="text-xs text-gray-900 mt-2">
                    Toque para cambiar
                  </Text>
                </View>
              ) : (
                <>
                  <View className="bg-orange-200 p-4 rounded-xl  border-orange-300 mb-2 ">
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
          <View className="mb-20 bg-orange-50 p-4 rounded-xl border border-orange-100 py-3">
            <Text className="text-base font-bold mb-3">
              Número de Referencia / Transacción Bancaria
            </Text>
            <TextInput
              value={referenceId}
              onChangeText={setReferenceId}
              placeholder="Ej: 12345678"
              placeholderTextColor="#9CA3AF"
              className=" text-gray-900 text-base"
              style={{
                borderColor: "orange",
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 4,
                paddingVertical: 6,
              }}
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
          disabled={isLoading || !referenceId || !isImagen}
        />
      }
      isOpen={showBankTransferModal}
      header={<Text className="text-xl font-bold">Transferencia Bancaria</Text>}
      onClose={() => setShowBankTransferModal(false)}
    />
  );
};

export default BankTransferModal;
