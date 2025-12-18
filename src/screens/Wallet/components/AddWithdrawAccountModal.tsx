import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import {
  X,
  Globe,
  RefreshCcw,
  User,
  CreditCard,
  Landmark,
  Check,
} from "lucide-react-native";

interface AddWithdrawAccountModalProps {
  visible: boolean;
  onClose: () => void;
  form: any;
}

export const AddWithdrawAccountModal: React.FC<
  AddWithdrawAccountModalProps
> = ({ visible, onClose, form }) => {
  const {
    holderName,
    setHolderName,
    holderDocument,
    setHolderDocument,
    bankCode,
    setBankCode,
    bankName,
    setBankName,
    setCbu,
    alias,
    setAlias,
    provider,
    setProvider,
    phone,
    setPhone,
    errors,
    handleSubmit,
    submitting,
    loading,
  } = form;
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [holderDocumentType, setHolderDocumentType] = useState("");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showAccountTypePicker, setShowAccountTypePicker] = useState(false);
  const [showDocTypePicker, setShowDocTypePicker] = useState(false);
  const docTypes = ["DNI", "CUIT", "CUIL", "CÉDULA", "RUC", "NIT"];
  const countries = [
    { label: "Argentina", value: "ARGENTINA" },
    { label: "Colombia", value: "COLOMBIA" },
    { label: "Ecuador", value: "ECUADOR" },
    { label: "Uruguay", value: "URUGUAY" },
    { label: "Chile", value: "CHILE" },
    { label: "Perú", value: "PERU" },
  ];
  const currencies = [
    { label: "ARS - Peso Argentino", value: "ARS" },
    { label: "USD - Dólar Estadounidense", value: "USD" },
    { label: "COP - Peso Colombiano", value: "COP" },
    { label: "UYU - Peso Uruguayo", value: "UYU" },
    { label: "CLP - Peso Chileno", value: "CLP" },
    { label: "PEN - Sol Peruano", value: "PEN" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      >
        <View
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 16,
          }}
          className="w-full max-w-xl bg-[#181411] rounded-2xl border border-[#28221c] overflow-hidden"
        >
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            {/* País */}
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                País
              </Text>
              <TouchableOpacity
                className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 flex-row items-center"
                onPress={() => setShowCountryPicker(true)}
              >
                <Text
                  className={`flex-1 ${
                    country ? "text-white" : "text-[#57534e]"
                  }`}
                >
                  {countries.find((c: any) => c.value === country)?.label ||
                    "Seleccionar país"}
                </Text>
                <Text className="text-[#57534e]">▼</Text>
              </TouchableOpacity>
              {showCountryPicker && (
                <Modal
                  visible={showCountryPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCountryPicker(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPressOut={() => setShowCountryPicker(false)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <View className="bg-[#181411] p-4 rounded-t-2xl border-t border-[#28221c]">
                        {countries.map((c: any) => (
                          <TouchableOpacity
                            key={c.value}
                            className="py-3 px-2"
                            onPress={() => {
                              setCountry(c.value);
                              if (form.setCountry) form.setCountry(c.value);
                              setShowCountryPicker(false);
                            }}
                          >
                            <Text className="text-white text-base">
                              {c.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
              {errors?.country && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.country}
                </Text>
              )}
            </View>

            {/* Moneda */}
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                Moneda
              </Text>
              <TouchableOpacity
                className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 flex-row items-center"
                onPress={() => setShowCurrencyPicker(true)}
              >
                <Text
                  className={`flex-1 ${
                    currency ? "text-white" : "text-[#57534e]"
                  }`}
                >
                  {currencies.find((c: any) => c.value === currency)?.label ||
                    "Seleccionar moneda"}
                </Text>
                <Text className="text-[#57534e]">▼</Text>
              </TouchableOpacity>
              {showCurrencyPicker && (
                <Modal
                  visible={showCurrencyPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCurrencyPicker(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPressOut={() => setShowCurrencyPicker(false)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <View className="bg-[#181411] p-4 rounded-t-2xl border-t border-[#28221c]">
                        {currencies.map((c: any) => (
                          <TouchableOpacity
                            key={c.value}
                            className="py-3 px-2"
                            onPress={() => {
                              setCurrency(c.value);
                              if (form.setCurrency) form.setCurrency(c.value);
                              setShowCurrencyPicker(false);
                            }}
                          >
                            <Text className="text-white text-base">
                              {c.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
              {errors?.currency && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.currency}
                </Text>
              )}
            </View>

            {/* Banco */}
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                Banco
              </Text>
              <TextInput
                placeholder="Código de banco"
                placeholderTextColor="#57534e"
                className="mb-2 flex-1 text-white"
                value={form.bankCode}
                onChangeText={(text) =>
                  form.setBankCode(text.replace(/\n/g, "").trim())
                }
                multiline={false}
              />
              <TextInput
                placeholder="Nombre del banco"
                placeholderTextColor="#57534e"
                className="flex-1 text-white"
                value={form.bankName}
                onChangeText={(text) =>
                  form.setBankName(text.replace(/\n/g, "").trim())
                }
                multiline={false}
              />
              {errors?.bankCode && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.bankCode}
                </Text>
              )}
              {errors?.bankName && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.bankName}
                </Text>
              )}
            </View>

            {/* Tipo de Cuenta (Selector) */}
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                Tipo de Cuenta
              </Text>
              <TouchableOpacity
                className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 flex-row items-center"
                onPress={() => setShowAccountTypePicker(true)}
              >
                <Text
                  className={`flex-1 ${
                    form.selectedType ? "text-white" : "text-[#57534e]"
                  }`}
                >
                  {form.accountTypes
                    ?.flat?.()
                    .find((t: any) => t.id === form.selectedType)?.name ||
                    "Seleccionar tipo de cuenta"}
                </Text>
                <Text className="text-[#57534e]">▼</Text>
              </TouchableOpacity>
              {showAccountTypePicker && (
                <Modal
                  visible={showAccountTypePicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowAccountTypePicker(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPressOut={() => setShowAccountTypePicker(false)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <View className="bg-[#181411] p-4 rounded-t-2xl border-t border-[#28221c]">
                        {(form.accountTypes?.flat?.() || []).map(
                          (type: any) => (
                            <TouchableOpacity
                              key={type.id}
                              className="py-3 px-2"
                              onPress={() => {
                                if (
                                  typeof form.setSelectedType === "function"
                                ) {
                                  form.setSelectedType(type.id);
                                }
                                setShowAccountTypePicker(false);
                              }}
                            >
                              <Text className="text-white text-base">
                                {type.name}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
              {errors?.selectedType && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.selectedType}
                </Text>
              )}
            </View>

            {/* Identificadores bancarios condicionales eliminados por país, solo por tipo de cuenta */}
            {(form.country === "ECUADOR" || form.country === "COLOMBIA") && (
              <View className="mb-4">
                <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                  Número de cuenta bancaria
                </Text>
                <TextInput
                  placeholder="Número de cuenta"
                  placeholderTextColor="#57534e"
                  className="flex-1 text-white"
                  value={form.accountNumber}
                  onChangeText={(text) =>
                    form.setAccountNumber(text.replace(/\n/g, "").trim())
                  }
                  multiline={false}
                />
                {errors?.accountNumber && (
                  <Text className="text-xs text-red-500 mt-1">
                    {errors.accountNumber}
                  </Text>
                )}
              </View>
            )}

            {/* Datos del titular */}
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                Nombre del titular
              </Text>
              <TextInput
                placeholder="Nombre completo"
                placeholderTextColor="#57534e"
                className="flex-1 text-white"
                value={form.holderName}
                onChangeText={(text) =>
                  form.setHolderName(text.replace(/\n/g, "").trim())
                }
                multiline={false}
              />
              {errors?.holderName && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.holderName}
                </Text>
              )}
            </View>
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                Documento del titular
              </Text>
              <TextInput
                placeholder="Documento"
                placeholderTextColor="#57534e"
                className="flex-1 text-white"
                value={form.holderDocument}
                onChangeText={(text) =>
                  form.setHolderDocument(
                    text
                      .replace(/[^0-9]/g, "")
                      .replace(/\n/g, "")
                      .trim()
                  )
                }
                keyboardType="numeric"
                maxLength={15}
                multiline={false}
              />
              {errors?.holderDocument && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.holderDocument}
                </Text>
              )}
            </View>
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                Tipo de documento
              </Text>
              <TouchableOpacity
                className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 flex-row items-center"
                onPress={() => setShowDocTypePicker(true)}
              >
                <Text
                  className={`flex-1 ${
                    holderDocumentType ? "text-white" : "text-[#57534e]"
                  }`}
                >
                  {holderDocumentType || "Seleccionar tipo de documento"}
                </Text>
                <Text className="text-[#57534e]">▼</Text>
              </TouchableOpacity>
              {showDocTypePicker && (
                <Modal
                  visible={showDocTypePicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowDocTypePicker(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPressOut={() => setShowDocTypePicker(false)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <View className="bg-[#181411] p-4 rounded-t-2xl border-t border-[#28221c]">
                        {docTypes.map((type) => (
                          <TouchableOpacity
                            key={type}
                            className="py-3 px-2"
                            onPress={() => {
                              setHolderDocumentType(type);
                              if (form.setHolderDocumentType)
                                form.setHolderDocumentType(type);
                              setShowDocTypePicker(false);
                            }}
                          >
                            <Text className="text-white text-base">{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
              {errors?.holderDocumentType && (
                <Text className="text-xs text-red-500 mt-1">
                  {errors.holderDocumentType}
                </Text>
              )}
            </View>

            {/* Campos condicionales según tipo de cuenta */}
            {form.selectedType &&
              ["BANK", "CORRIENTE", "AHORRO"].includes(
                form.accountTypes
                  ?.flat?.()
                  .find((t: any) => t.id === form.selectedType)?.code || ""
              ) && (
                <>
                  <View className="mb-4">
                    <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                      CBU
                    </Text>
                    <TextInput
                      placeholder="CBU (22 dígitos)"
                      placeholderTextColor="#57534e"
                      className="flex-1 text-white"
                      value={form.cbu}
                      onChangeText={(text) =>
                        form.setCbu(text.replace(/[^0-9]/g, "").slice(0, 22))
                      }
                      keyboardType="numeric"
                      maxLength={22}
                      multiline={false}
                    />
                    {errors?.cbu && (
                      <Text className="text-xs text-red-500 mt-1">
                        {errors.cbu}
                      </Text>
                    )}
                  </View>
                  <View className="mb-4">
                    <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                      Alias (opcional)
                    </Text>
                    <TextInput
                      placeholder="Alias bancario"
                      placeholderTextColor="#57534e"
                      className="flex-1 text-white"
                      value={form.alias}
                      onChangeText={(text) =>
                        form.setAlias(text.replace(/\n/g, "").trim())
                      }
                      multiline={false}
                    />
                    {errors?.alias && (
                      <Text className="text-xs text-red-500 mt-1">
                        {errors.alias}
                      </Text>
                    )}
                  </View>
                </>
              )}
            {form.selectedType &&
              form.accountTypes.find((t: any) => t.id === form.selectedType)
                ?.code === "WALLET" && (
                <>
                  <View className="mb-4">
                    <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                      Proveedor
                    </Text>
                    <TextInput
                      placeholder="Proveedor (ej: MercadoPago, Payphone)"
                      placeholderTextColor="#57534e"
                      className="flex-1 text-white"
                      value={form.provider}
                      onChangeText={(text) =>
                        form.setProvider(text.replace(/\n/g, "").trim())
                      }
                      multiline={false}
                    />
                    {errors?.provider && (
                      <Text className="text-xs text-red-500 mt-1">
                        {errors.provider}
                      </Text>
                    )}
                  </View>
                  <View className="mb-4">
                    <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                      Teléfono
                    </Text>
                    <TextInput
                      placeholder="Teléfono (solo números)"
                      placeholderTextColor="#57534e"
                      className="flex-1 text-white"
                      value={form.phone}
                      onChangeText={(text) =>
                        form.setPhone(text.replace(/\n/g, "").trim())
                      }
                      keyboardType="phone-pad"
                      maxLength={15}
                      multiline={false}
                    />
                    {errors?.phone && (
                      <Text className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </Text>
                    )}
                  </View>
                </>
              )}

            {/* Botones de Acción */}
            <View className="flex-row justify-end gap-3 mt-2">
              <TouchableOpacity
                className="px-6 py-2.5 rounded-lg border border-[#3f3a36] bg-[#181411]"
                onPress={onClose}
              >
                <Text className="text-[#b9aa9d] font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2.5 rounded-lg bg-[#f97316] flex-row items-center"
                onPress={() => {
                  // Mantener el estado del hook sincronizado (opcional)
                  if (form.setCountry) form.setCountry(country);
                  if (form.setCurrency) form.setCurrency(currency);
                  if (form.setHolderDocumentType)
                    form.setHolderDocumentType(holderDocumentType);
                  // Llamar a handleSubmit pasando los valores locales para evitar condiciones de carrera
                  if (typeof handleSubmit === "function") {
                    handleSubmit({
                      country: country,
                      currency: currency,
                      holderDocumentType: holderDocumentType,
                      cbu: form.cbu,
                      alias: form.alias,
                      selectedType: form.selectedType,
                    });
                  }
                }}
                disabled={submitting || loading}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Check size={18} color="white" className="mr-2" />
                    <Text className="text-white font-bold">Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AddWithdrawAccountModal;
