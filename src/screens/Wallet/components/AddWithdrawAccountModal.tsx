import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";
import {
  X,
  Globe,
  RefreshCcw,
  User,
  CreditCard,
  Landmark,
  Check,
  DollarSign,
  CircleAlert,
} from "lucide-react-native";
import { useNotify } from "src/hooks";
import { WithdrawService } from "src/services/withdrawService";
import Toast, { BaseToast } from "react-native-toast-message";
import { toastConfig } from "src/components/shared/notification/GlobalNotification";

// Helper to normalize document type by removing accents
const normalizeDocType = (docType: string): string => {
  const map: { [key: string]: string } = {
    CÉDULA: "CEDULA",
    CEDULA: "CEDULA",
  };
  return map[docType] || docType;
};

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
  const notify = useNotify();

  useEffect(() => {
    if (!errors) return;

    const msgs: string[] = [];
    const pushMessage = (m: any) => {
      if (!m && m !== 0) return;
      const txt = String(m);
      if (txt.includes("accountNumber must be longer")) {
        msgs.push("El número de cuenta debe tener al menos 4 caracteres");
      } else {
        msgs.push(txt);
      }
    };

    if (Array.isArray(errors.message) && errors.message.length) {
      errors.message.forEach(pushMessage);
    } else {
      Object.keys(errors).forEach((k) => {
        const v = (errors as any)[k];
        if (Array.isArray(v)) {
          v.forEach(pushMessage);
        } else if (typeof v === "string") {
          pushMessage(v);
        }
      });
    }

    const unique = Array.from(new Set(msgs.filter(Boolean)));
    unique.forEach((m) =>
      Toast.show({
        type: "error",
        text1: m,
        position: "top",
        topOffset: 8,
        visibilityTime: 4000,
      })
    );
  }, [errors]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [holderDocumentType, setHolderDocumentType] = useState("");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showAccountTypePicker, setShowAccountTypePicker] = useState(false);
  const [showDocTypePicker, setShowDocTypePicker] = useState(false);
  const [docTypes, setDocTypes] = useState<string[]>([
    "DNI",
    "CUIT",
    "CUIL",
    "CÉDULA",
    "RUC",
    "NIT",
  ]);
  const [countries, setCountries] = useState<
    { label: string; value: string }[]
  >([
    { label: "Argentina", value: "ARGENTINA" },
    { label: "Ecuador", value: "ECUADOR" },
  ]);
  const [currencies, setCurrencies] = useState<
    { label: string; value: string }[]
  >([
    { label: "ARS - Peso Argentino", value: "ARS" },
    { label: "USD - Dólar Estadounidense", value: "USD" },
  ]);
  const [enumsLoading, setEnumsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchEnums = async () => {
      try {
        setEnumsLoading(true);
        const res = await WithdrawService.getWithdrawEnums();
        if (!mounted) return;
        if (res?.countrys) {
          const vals = Object.values(res.countrys).filter(
            (v) => typeof v === "string"
          ) as string[];
          setCountries(vals.map((v) => ({ label: v, value: v })));
        }
        if (res?.currency) {
          const vals = Object.values(res.currency).filter(
            (v) => typeof v === "string"
          ) as string[];
          setCurrencies(vals.map((v) => ({ label: v, value: v })));
        }
        if (res?.documentType) {
          const vals = Object.values(res.documentType).filter(
            (v) => typeof v === "string"
          ) as string[];
          setDocTypes(vals);
        }
        if (form.country) setCountry(form.country);
        if (form.currency) setCurrency(form.currency);
        if (form.holderDocumentType)
          setHolderDocumentType(form.holderDocumentType);
      } catch (err) {
        // Fallback to local defaults if backend /enums is temporarily broken (avoid surfacing 400)
        if (mounted) {
          setCountries([
            { label: "Argentina", value: "ARGENTINA" },
            { label: "Ecuador", value: "ECUADOR" },
          ]);
          setCurrencies([
            { label: "ARS - Peso Argentino", value: "ARS" },
            { label: "USD - Dólar Estadounidense", value: "USD" },
          ]);
          setDocTypes(["DNI", "CUIT", "CUIL", "CÉDULA", "RUC", "NIT"]);
        }
      } finally {
        if (mounted) setEnumsLoading(false);
      }
    };
    fetchEnums();
    return () => {
      mounted = false;
    };
  }, []);

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
        <Toast config={toastConfig} />
        <View
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 16,
            maxHeight:
              Platform.OS === "web"
                ? Dimensions.get("window").height * 0.9
                : undefined,
            width: "100%",
          }}
          className=" w-full max-w-xl bg-[#181411] rounded-2xl border border-[#28221c] overflow-hidden"
        >
          <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
            keyboardShouldPersistTaps="handled"
            style={{
              maxHeight:
                Platform.OS === "web"
                  ? Dimensions.get("window").height * 0.7
                  : undefined,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 border-b border-[#28221c]">
              <Text className="text-white text-lg font-bold">
                Crear Cuenta Bancaria
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <X size={20} color="#b9aa9d" />
              </TouchableOpacity>
            </View>

            {/* Row: País / Moneda */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
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
                  <Globe size={16} color="#b9aa9d" />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
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
                  <DollarSign size={16} color="#b9aa9d" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Country picker modal */}
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
                            // clear AR-only fields when selecting other countries
                            if (c.value !== "ARGENTINA") {
                              if (form.setCbu) form.setCbu("");
                              if (form.setAlias) form.setAlias("");
                            }
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

            {/* Currency picker modal */}
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

            {/* Row: Código banco / Nombre banco */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                  Código del banco
                </Text>
                <TextInput
                  placeholder="Ej. 00123"
                  placeholderTextColor="#57534e"
                  className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                  value={form.bankCode}
                  onChangeText={(text) =>
                    form.setBankCode(text.replace(/\n/g, "").trim())
                  }
                  multiline={false}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                  Nombre del banco
                </Text>
                <TextInput
                  placeholder="Ej. Banco Nación"
                  placeholderTextColor="#57534e"
                  className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                  value={form.bankName}
                  onChangeText={(text) =>
                    form.setBankName(text.replace(/\n/g, "").trim())
                  }
                  multiline={false}
                />
              </View>
            </View>

            {/* Tipo de Cuenta */}
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
                <CreditCard size={16} color="#b9aa9d" />
                <Text className="text-[#57534e] ml-2">▼</Text>
              </TouchableOpacity>
            </View>

            {/* Account type picker modal */}
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
                      {(
                        form.accountTypes
                          ?.flat?.()
                          .filter(
                            (t: any) => t?.name && String(t.name).trim()
                          ) || []
                      ).map((type: any) => (
                        <TouchableOpacity
                          key={type.id}
                          className="py-3 px-2 flex-row items-center"
                          onPress={() => {
                            if (typeof form.setSelectedType === "function") {
                              form.setSelectedType(type.id);
                            }
                            setShowAccountTypePicker(false);
                          }}
                        >
                          <CreditCard
                            size={16}
                            color="#b9aa9d"
                            className="mr-2"
                          />
                          <Text className="text-white text-base">
                            {type.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            {/* Campos condicionales según tipo de cuenta (mantener como antes) */}
            {(form.country === "ECUADOR" || form.country === "COLOMBIA") && (
              <View className="mb-4">
                <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                  Número de cuenta bancaria
                </Text>
                <TextInput
                  placeholder="Número de cuenta"
                  placeholderTextColor="#57534e"
                  className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                  value={form.accountNumber}
                  onChangeText={(text) =>
                    form.setAccountNumber(text.replace(/\n/g, "").trim())
                  }
                  multiline={false}
                />
              </View>
            )}

            {/* Datos del titular */}
            <View className="mb-4">
              <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                Nombre del titular
              </Text>
              <TextInput
                placeholder="Nombre completo como figura en el banco"
                placeholderTextColor="#57534e"
                className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                value={form.holderName}
                onChangeText={(text) =>
                  form.setHolderName(text.replace(/\n/g, "").trim())
                }
                multiline={false}
              />
            </View>

            {/* Documento: tipo + número en una fila */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
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
                    {holderDocumentType || "DNI"}
                  </Text>
                  <User size={16} color="#b9aa9d" />
                  <Text className="text-[#57534e] ml-2">▼</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                  Documento del titular
                </Text>
                <TextInput
                  placeholder="Número de documento"
                  placeholderTextColor="#57534e"
                  className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
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
              </View>
            </View>

            {/* Doc type picker modal */}
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
                          className="py-3 px-2 flex-row items-center"
                          onPress={() => {
                            setHolderDocumentType(type);
                            if (form.setHolderDocumentType)
                              form.setHolderDocumentType(type);
                            setShowDocTypePicker(false);
                          }}
                        >
                          <User size={16} color="#b9aa9d" className="mr-2" />
                          <Text className="text-white text-base">{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            {/* Campos condicionales según tipo de cuenta (CBU/Alias o WALLET) */}
            {form.selectedType &&
              ["BANK", "CORRIENTE", "AHORRO"].includes(
                form.accountTypes
                  ?.flat?.()
                  .find((t: any) => t.id === form.selectedType)?.code || ""
              ) && (
                <>
                  {/* Only show CBU/Alias for Argentina (backend requires CBU for AR) */}
                  {form.country === "ARGENTINA" && (
                    <>
                      <View className="mb-4">
                        <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                          CBU
                        </Text>
                        <TextInput
                          placeholder="CBU (22 dígitos)"
                          placeholderTextColor="#57534e"
                          className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                          value={form.cbu}
                          onChangeText={(text) =>
                            form.setCbu(
                              text.replace(/[^0-9]/g, "").slice(0, 22)
                            )
                          }
                          keyboardType="numeric"
                          maxLength={22}
                          multiline={false}
                        />
                      </View>
                      <View className="mb-4">
                        <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                          Alias (opcional)
                        </Text>
                        <TextInput
                          placeholder="Alias bancario"
                          placeholderTextColor="#57534e"
                          className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                          value={form.alias}
                          onChangeText={(text) =>
                            form.setAlias(text.replace(/\n/g, "").trim())
                          }
                          multiline={false}
                        />
                      </View>
                    </>
                  )}
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
                      className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                      value={form.provider}
                      onChangeText={(text) =>
                        form.setProvider(text.replace(/\n/g, "").trim())
                      }
                      multiline={false}
                    />
                  </View>
                  <View className="mb-4">
                    <Text className="text-[#b9aa9d] text-xs font-semibold mb-2 uppercase tracking-wider">
                      Teléfono
                    </Text>
                    <TextInput
                      placeholder="Número de teléfono"
                      placeholderTextColor="#57534e"
                      className="bg-[#181411] border border-[#3f3a36] rounded-lg px-3 h-12 text-white"
                      value={form.phone}
                      onChangeText={(text) =>
                        form.setPhone(text.replace(/\n/g, "").trim())
                      }
                      keyboardType="phone-pad"
                      maxLength={15}
                      multiline={false}
                    />
                  </View>
                </>
              )}
          </ScrollView>

          {/* Footer fijo con acciones */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#28221c",
              padding: 16,
              backgroundColor: "#181411",
            }}
          >
            <View className="flex-row justify-center gap-3">
              <TouchableOpacity
                className="px-6 py-2.5 rounded-lg border border-[#3f3a36] bg-[#181411]"
                onPress={onClose}
              >
                <Text className="text-[#b9aa9d] font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2.5 rounded-lg bg-[#f97316] flex-row items-center"
                onPress={() => {
                  if (form.setCountry) form.setCountry(country);
                  if (form.setCurrency) form.setCurrency(currency);
                  const normalizedDocType =
                    normalizeDocType(holderDocumentType);
                  if (form.setHolderDocumentType)
                    form.setHolderDocumentType(normalizedDocType);
                  if (typeof handleSubmit === "function") {
                    handleSubmit({
                      country: country,
                      currency: currency,
                      holderDocumentType: normalizedDocType,
                      cbu: form.cbu,
                      alias: form.alias,
                      accountNumber: form.accountNumber,
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
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AddWithdrawAccountModal;
