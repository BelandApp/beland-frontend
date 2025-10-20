import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  withdrawService,
  WithdrawAccountType,
} from "../../../services/withdrawService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

interface AddWithdrawAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export const AddWithdrawAccountModal: React.FC<
  AddWithdrawAccountModalProps
> = ({ visible, onClose, onAdd }) => {
  const [accountTypes, setAccountTypes] = useState<WithdrawAccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [ownerName, setOwnerName] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Para cuentas bancarias (BANK)
  const [cbu, setCbu] = useState("");
  const [alias, setAlias] = useState("");

  // Para billeteras virtuales (WALLET) como Payphone
  const [provider, setProvider] = useState("Payphone");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+54"); // Dinámico

  // Estados para validaciones
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Códigos de país comunes en Latinoamérica
  const countryCodes = [
    { code: "+54", country: "Argentina", flag: "🇦🇷", pattern: /^(9\d{8,10})$/ },
    { code: "+56", country: "Chile", flag: "🇨🇱", pattern: /^([1-9]\d{7,8})$/ },
    { code: "+57", country: "Colombia", flag: "🇨🇴", pattern: /^([1-9]\d{9})$/ },
    { code: "+51", country: "Perú", flag: "🇵🇪", pattern: /^([1-9]\d{8})$/ },
    { code: "+52", country: "México", flag: "🇲🇽", pattern: /^([1-9]\d{9})$/ },
    { code: "+593", country: "Ecuador", flag: "🇪🇨", pattern: /^([1-9]\d{8})$/ },
    { code: "+598", country: "Uruguay", flag: "🇺🇾", pattern: /^([1-9]\d{7})$/ },
    {
      code: "+595",
      country: "Paraguay",
      flag: "🇵🇾",
      pattern: /^([1-9]\d{8})$/,
    },
  ];

  useEffect(() => {
    if (visible) {
      loadAccountTypes();
      resetForm();
    }
  }, [visible]);

  const loadAccountTypes = async () => {
    try {
      setLoading(true);
      const types = await withdrawService.getWithdrawAccountTypes();
      setAccountTypes(types);
    } catch (error) {
      console.error("Error cargando tipos de cuenta:", error);
      Alert.alert("Error", "No se pudieron cargar los tipos de cuenta");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOwnerName("");
    setSelectedType("");
    setCbu("");
    setAlias("");
    setProvider("Payphone");
    setPhone("");
    setErrors({});
    setTouched({});
  };

  const getSelectedTypeData = () => {
    return accountTypes.find((type) => type.id === selectedType);
  };

  const isWalletAccount = () => {
    const typeData = getSelectedTypeData();
    return typeData?.code === "WALLET";
  };

  const isBankAccount = () => {
    const typeData = getSelectedTypeData();
    return typeData?.code === "BANK";
  };

  // Validaciones en tiempo real
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "ownerName":
        if (!value.trim()) {
          newErrors.ownerName = "El nombre del propietario es obligatorio";
        } else if (value.trim().length < 2) {
          newErrors.ownerName = "El nombre debe tener al menos 2 caracteres";
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          newErrors.ownerName = "Solo se permiten letras y espacios";
        } else {
          delete newErrors.ownerName;
        }
        break;

      case "phone":
        const cleanPhone = value.replace(/\D/g, "");
        if (!cleanPhone) {
          newErrors.phone = "El teléfono es obligatorio";
        } else if (cleanPhone.length < 8) {
          newErrors.phone = "El teléfono debe tener al menos 8 dígitos";
        } else if (cleanPhone.length > 15) {
          newErrors.phone = "El teléfono no puede tener más de 15 dígitos";
        } else {
          delete newErrors.phone;
        }
        break;

      case "cbu":
        if (value && !/^\d{22}$/.test(value)) {
          newErrors.cbu = "El CBU debe tener exactamente 22 dígitos";
        } else {
          delete newErrors.cbu;
        }
        break;

      case "alias":
        if (value && value.length < 6) {
          newErrors.alias = "El alias debe tener al menos 6 caracteres";
        } else if (value && !/^[a-zA-Z0-9.-]+$/.test(value)) {
          newErrors.alias =
            "Solo se permiten letras, números, puntos y guiones";
        } else {
          delete newErrors.alias;
        }
        break;

      case "selectedType":
        if (!value) {
          newErrors.selectedType = "Debe seleccionar un tipo de cuenta";
        } else {
          delete newErrors.selectedType;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "ownerName":
        setOwnerName(value);
        break;
      case "phone":
        // Solo permitir números y formatear
        const cleanPhone = value.replace(/\D/g, "");
        const formattedPhone = formatPhoneNumber(cleanPhone);
        setPhone(formattedPhone);
        break;
      case "cbu":
        // Solo permitir números
        const cleanCbu = value.replace(/\D/g, "");
        setCbu(cleanCbu);
        break;
      case "alias":
        setAlias(value.toLowerCase());
        break;
      case "provider":
        setProvider(value);
        break;
      case "selectedType":
        setSelectedType(value);
        break;
    }

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, value);
  };

  // Detectar código de país automáticamente de manera más intuitiva
  const detectCountryCode = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Si está vacío, mantener el actual
    if (cleanPhone.length === 0) return countryCode;

    // Detección más temprana y precisa por patrones específicos
    if (cleanPhone.length >= 2) {
      // Argentina: números que empiezan con 9, 11, 15, o códigos de área argentinos
      if (
        cleanPhone.match(
          /^(9[0-9]|11|15|221|223|261|341|351|381|385|387|388|2902|2920|2966)/
        )
      ) {
        return "+54";
      }

      // Chile: números que empiezan con 2, 6, 7, 8, 9 y tienen patrones chilenos
      if (
        cleanPhone.match(/^[2-9][0-9]/) &&
        !cleanPhone.startsWith("9") &&
        cleanPhone.length >= 8
      ) {
        return "+56";
      }

      // Colombia: 3xx (móviles), 1, 4, 5, 6, 7 (fijos)
      if (cleanPhone.match(/^3[0-9][0-9]/) || cleanPhone.match(/^[1-7][0-9]/)) {
        return "+57";
      }

      // México: 55, 33, 81, 222, etc.
      if (
        cleanPhone.match(
          /^(55|33|81|222|228|229|238|246|248|271|272|273|274|275|276|277|278|279)/
        )
      ) {
        return "+52";
      }

      // Perú: 9 seguido de dígitos (móviles) o 1, 4, 5, 6, 7 (Lima y provincias)
      if (cleanPhone.match(/^9[0-9]/) && cleanPhone.length >= 8) {
        return "+51";
      }

      // Ecuador: 09 (móviles) o 02, 03, 04, 05, 06, 07 (provincias)
      if (cleanPhone.match(/^(09|0[2-7])/)) {
        return "+593";
      }

      // Uruguay: 9 y longitud específica
      if (cleanPhone.startsWith("9") && cleanPhone.length <= 8) {
        return "+598";
      }

      // Paraguay: 9 y patrones específicos
      if (cleanPhone.match(/^9[6-9][0-9]/) && cleanPhone.length <= 9) {
        return "+595";
      }
    }

    // Si no coincide con ningún patrón específico, mantener el código actual
    return countryCode;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");

    // Solo auto-detectar si hay suficientes dígitos para ser confiable
    if (cleanPhone.length >= 3) {
      const detectedCode = detectCountryCode(cleanPhone);
      // Solo cambiar el código si es diferente y la detección es confiable
      if (detectedCode !== countryCode && cleanPhone.length >= 6) {
        setCountryCode(detectedCode);
      }
    }

    // Usar el código actual para formatear (no el detectado)
    const currentCode = countryCode;

    // Formatear según el país actual
    switch (currentCode) {
      case "+54": // Argentina: 9 11 1234 5678 o 11 1234 5678
        if (cleanPhone.length <= 1) return cleanPhone;
        if (cleanPhone.startsWith("9")) {
          // Formato con 9: 9 11 1234 5678
          if (cleanPhone.length <= 3)
            return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1)}`;
          if (cleanPhone.length <= 7)
            return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
              1,
              3
            )} ${cleanPhone.slice(3)}`;
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
            1,
            3
          )} ${cleanPhone.slice(3, 7)} ${cleanPhone.slice(7)}`;
        } else {
          // Formato sin 9: 11 1234 5678
          if (cleanPhone.length <= 2) return cleanPhone;
          if (cleanPhone.length <= 6)
            return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2)}`;
          return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(
            2,
            6
          )} ${cleanPhone.slice(6)}`;
        }

      case "+56": // Chile: 6 1234 5678 o 2 1234 5678
        if (cleanPhone.length <= 1) return cleanPhone;
        if (cleanPhone.length <= 5)
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1)}`;
        return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
          1,
          5
        )} ${cleanPhone.slice(5)}`;

      case "+57": // Colombia: 312 345 6789 o 1 234 5678
        if (cleanPhone.length <= 1) return cleanPhone;
        if (cleanPhone.startsWith("3")) {
          // Móvil: 312 345 6789
          if (cleanPhone.length <= 3) return cleanPhone;
          if (cleanPhone.length <= 6)
            return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`;
          return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(
            3,
            6
          )} ${cleanPhone.slice(6)}`;
        } else {
          // Fijo: 1 234 5678
          if (cleanPhone.length <= 3)
            return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1)}`;
          if (cleanPhone.length <= 6)
            return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
              1,
              4
            )} ${cleanPhone.slice(4)}`;
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
            1,
            4
          )} ${cleanPhone.slice(4, 8)}`;
        }

      case "+52": // México: 55 1234 5678
        if (cleanPhone.length <= 2) return cleanPhone;
        if (cleanPhone.length <= 6)
          return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2)}`;
        return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(
          2,
          6
        )} ${cleanPhone.slice(6)}`;

      case "+51": // Perú: 9 1234 5678 o 1 234 5678
        if (cleanPhone.length <= 1) return cleanPhone;
        if (cleanPhone.startsWith("9")) {
          // Móvil: 9 1234 5678
          if (cleanPhone.length <= 5)
            return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1)}`;
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
            1,
            5
          )} ${cleanPhone.slice(5)}`;
        } else {
          // Fijo: 1 234 5678
          if (cleanPhone.length <= 3)
            return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1)}`;
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
            1,
            4
          )} ${cleanPhone.slice(4)}`;
        }

      case "+593": // Ecuador: 09 1234 5678 o 02 123 4567
        if (cleanPhone.length <= 2) return cleanPhone;
        if (cleanPhone.length <= 6)
          return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2)}`;
        return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(
          2,
          5
        )} ${cleanPhone.slice(5)}`;

      case "+598": // Uruguay: 9 123 4567
        if (cleanPhone.length <= 1) return cleanPhone;
        if (cleanPhone.length <= 4)
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1)}`;
        return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
          1,
          4
        )} ${cleanPhone.slice(4)}`;

      case "+595": // Paraguay: 9XX XXX XXX
        if (cleanPhone.length <= 1) return cleanPhone;
        if (cleanPhone.length <= 4)
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1)}`;
        if (cleanPhone.length <= 7)
          return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
            1,
            4
          )} ${cleanPhone.slice(4)}`;
        return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(
          1,
          4
        )} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;

      default:
        // Formato genérico
        if (cleanPhone.length <= 3) return cleanPhone;
        if (cleanPhone.length <= 6)
          return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`;
        if (cleanPhone.length <= 10)
          return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(
            3,
            6
          )} ${cleanPhone.slice(6)}`;
        return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(
          3,
          6
        )} ${cleanPhone.slice(6, 10)} ${cleanPhone.slice(10)}`;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!ownerName.trim()) {
      newErrors.ownerName = "El nombre del propietario es obligatorio";
    }

    if (!selectedType) {
      newErrors.selectedType = "Debe seleccionar un tipo de cuenta";
    }

    if (isWalletAccount()) {
      const cleanPhone = phone.replace(/\D/g, "");
      if (!cleanPhone) {
        newErrors.phone = "El teléfono es obligatorio";
      } else if (cleanPhone.length < 10) {
        newErrors.phone = "El teléfono debe tener al menos 8 dígitos";
      }
    }

    if (isBankAccount()) {
      if (!cbu.trim() && !alias.trim()) {
        newErrors.general =
          "Debe ingresar al menos CBU o Alias para cuentas bancarias";
      }

      if (cbu.trim() && !/^\d{22}$/.test(cbu)) {
        newErrors.cbu = "El CBU debe tener exactamente 22 dígitos";
      }

      if (alias.trim() && alias.length < 6) {
        newErrors.alias = "El alias debe tener al menos 6 caracteres";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const accountData: any = {
        owner_name: ownerName.trim(),
        withdraw_account_type_id: selectedType,
      };

      if (isWalletAccount()) {
        accountData.provider = provider;
        accountData.phone = phone.replace(/\D/g, ""); // Enviar solo números
      }

      if (isBankAccount()) {
        if (cbu.trim()) {
          accountData.cbu = cbu.trim();
        }
        if (alias.trim()) {
          accountData.alias = alias.trim();
        }
      }

      console.log("Creando cuenta con datos:", accountData);

      await withdrawService.createWithdrawAccount(accountData);

      // Actualizar la lista de cuentas inmediatamente
      onAdd();

      // Cerrar inmediatamente
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error creando cuenta:", error);

      let errorMessage = "No se pudo agregar la cuenta. Intente nuevamente.";

      // Error específico de base de datos
      if (
        error?.message?.includes('column "is_active"') ||
        error?.message?.includes("does not exist")
      ) {
        errorMessage =
          "El sistema requiere actualización. Por favor contacte al administrador.";
      } else if (error?.message?.includes("InternalServerErrorException")) {
        errorMessage =
          "Error interno del servidor. Intente más tarde o contacte soporte.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormFields = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Cargando tipos de cuenta...</Text>
        </View>
      );
    }

    return (
      <View style={styles.formContainer}>
        {/* Error general */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Nombre del propietario */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Nombre del propietario <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.ownerName && styles.inputError,
              touched.ownerName && !errors.ownerName && styles.inputValid,
            ]}
            value={ownerName}
            onChangeText={(value) => handleFieldChange("ownerName", value)}
            onBlur={() => handleFieldBlur("ownerName", ownerName)}
            placeholder="Ingrese el nombre completo"
            placeholderTextColor="#999"
            autoCapitalize="words"
            maxLength={50}
          />
          {errors.ownerName && (
            <Text style={styles.fieldError}>{errors.ownerName}</Text>
          )}
        </View>

        {/* Tipo de cuenta */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Tipo de cuenta <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[
              styles.pickerContainer,
              errors.selectedType && styles.inputError,
              touched.selectedType && !errors.selectedType && styles.inputValid,
            ]}
          >
            <Picker
              selectedValue={selectedType}
              onValueChange={(value) => {
                handleFieldChange("selectedType", value);
                handleFieldBlur("selectedType", value);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar tipo de cuenta" value="" />
              {accountTypes.map((type) => (
                <Picker.Item key={type.id} label={type.name} value={type.id} />
              ))}
            </Picker>
          </View>
          {errors.selectedType && (
            <Text style={styles.fieldError}>{errors.selectedType}</Text>
          )}
        </View>

        {/* Campos específicos para billetera virtual (WALLET) */}
        {isWalletAccount() && (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Proveedor</Text>
              <View
                style={[
                  styles.pickerContainer,
                  errors.provider && styles.inputError,
                  touched.provider && !errors.provider && styles.inputValid,
                ]}
              >
                <Picker
                  selectedValue={provider}
                  onValueChange={(value) => {
                    handleFieldChange("provider", value);
                    handleFieldBlur("provider", value);
                  }}
                  style={styles.picker}
                  mode={Platform.OS === "ios" ? "dropdown" : "dropdown"}
                >
                  <Picker.Item label="Seleccionar proveedor" value="" />
                  <Picker.Item label="Payphone" value="Payphone" />
                  <Picker.Item label="MercadoPago" value="MercadoPago" />
                  <Picker.Item label="Produbanco" value="Produbanco" />
                  <Picker.Item label="Pichincha Bank" value="Pichincha Bank" />
                  <Picker.Item
                    label="Banco Guayaquil"
                    value="Banco Guayaquil"
                  />
                  <Picker.Item
                    label="Banco del Pacífico"
                    value="Banco del Pacífico"
                  />
                </Picker>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Teléfono <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity
                  style={[
                    styles.phonePrefix,
                    { opacity: showCountryPicker ? 0.7 : 1 },
                  ]}
                  onPress={() => {
                    setShowCountryPicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.phonePrefixText}>{countryCode} ▼</Text>
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.phoneInput,
                    errors.phone && styles.inputError,
                    touched.phone && !errors.phone && styles.inputValid,
                  ]}
                  value={phone}
                  onChangeText={(value) => handleFieldChange("phone", value)}
                  onBlur={() => handleFieldBlur("phone", phone)}
                  placeholder={
                    countryCode === "+54"
                      ? "911 1234 5678"
                      : countryCode === "+56"
                      ? "6 1234 5678"
                      : countryCode === "+57"
                      ? "312 345 6789"
                      : countryCode === "+52"
                      ? "55 1234 5678"
                      : countryCode === "+51"
                      ? "9 1234 5678"
                      : countryCode === "+593"
                      ? "09 1234 5678"
                      : countryCode === "+598"
                      ? "9 123 4567"
                      : countryCode === "+595"
                      ? "9XX XXX XXX"
                      : "Número de teléfono"
                  }
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={19} // Con espacios
                />
              </View>
              {errors.phone && (
                <Text style={styles.fieldError}>{errors.phone}</Text>
              )}
              <Text style={styles.helpText}>
                Formato: +54 911 1234 5678 (sin el primer 0)
              </Text>
            </View>
          </>
        )}

        {/* Campos específicos para cuenta bancaria (BANK) */}
        {isBankAccount() && (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>CBU (Clave Bancaria Uniforme)</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.cbu && styles.inputError,
                  touched.cbu && !errors.cbu && styles.inputValid,
                ]}
                value={cbu}
                onChangeText={(value) => handleFieldChange("cbu", value)}
                onBlur={() => handleFieldBlur("cbu", cbu)}
                placeholder="0123456789012345678901"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={22}
              />
              {errors.cbu && (
                <Text style={styles.fieldError}>{errors.cbu}</Text>
              )}
              <Text style={styles.helpText}>
                22 dígitos únicos de tu cuenta bancaria
              </Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Alias bancario</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.alias && styles.inputError,
                  touched.alias && !errors.alias && styles.inputValid,
                ]}
                value={alias}
                onChangeText={(value) => handleFieldChange("alias", value)}
                onBlur={() => handleFieldBlur("alias", alias)}
                placeholder="mi.cuenta.banco"
                placeholderTextColor="#999"
                maxLength={50}
                autoCapitalize="none"
              />
              {errors.alias && (
                <Text style={styles.fieldError}>{errors.alias}</Text>
              )}
              <Text style={styles.helpText}>
                Nombre personalizado para tu cuenta (ej: mi.cuenta.banco)
              </Text>
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                💡 Debes completar al menos CBU o Alias para cuentas bancarias
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Agregar Cuenta de Retiro</Text>
              <Text style={styles.subtitle}>
                Configura tu cuenta para retirar BeCoins
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderFormFields()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || loading}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Agregar Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal de selección de código de país */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.countryPickerOverlay}>
          <View style={styles.countryPickerContainer}>
            <Text style={styles.countryPickerTitle}>Seleccionar País</Text>
            <ScrollView style={styles.countryList}>
              {countryCodes.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    countryCode === country.code && styles.countryItemSelected,
                  ]}
                  onPress={() => {
                    setCountryCode(country.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryItemText}>
                    {country.flag} {country.code} {country.country}
                  </Text>
                  {countryCode === country.code && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: isWeb ? 20 : 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: isWeb ? Math.min(500, screenWidth * 0.9) : screenWidth * 0.95,
    maxHeight: screenHeight * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fafafa",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  content: {
    maxHeight: screenHeight * 0.6,
  },
  formContainer: {
    padding: 24,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#e74c3c",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#e74c3c",
    backgroundColor: "#fdf2f2",
  },
  inputValid: {
    borderColor: "#00A86B",
    backgroundColor: "#f0fdf4",
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: isWeb ? 50 : Platform.OS === "ios" ? 120 : 50,
    color: "#333",
    fontSize: 16,
    paddingHorizontal: isWeb ? 12 : 0,
    backgroundColor: "transparent",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phonePrefix: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  phoneInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  fieldError: {
    fontSize: 14,
    color: "#e74c3c",
    marginTop: 4,
    marginLeft: 4,
  },
  helpText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    marginLeft: 4,
    fontStyle: "italic",
  },
  noteContainer: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fafafa",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#00A86B",
    shadowColor: "#00A86B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Estilos para el modal de selección de país
  countryPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  countryPickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: isWeb ? Math.min(400, screenWidth * 0.8) : screenWidth * 0.9,
    maxHeight: screenHeight * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  countryPickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  countryList: {
    maxHeight: screenHeight * 0.4,
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  countryItemSelected: {
    backgroundColor: "#f0fdf4",
  },
  countryItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  checkMark: {
    fontSize: 18,
    color: "#00A86B",
    fontWeight: "bold",
  },
});
