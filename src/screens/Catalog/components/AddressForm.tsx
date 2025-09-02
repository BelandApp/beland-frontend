import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DeliveryAddress } from "../../../types/Order";
import { colors } from "../../../styles/colors";

interface AddressFormProps {
  initialAddress?: DeliveryAddress;
  onSubmit: (address: DeliveryAddress) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialAddress,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>(
    initialAddress || {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Ecuador",
      additionalInfo: "",
    }
  );

  const [errors, setErrors] = useState<Partial<DeliveryAddress>>({});
  const [touched, setTouched] = useState<Partial<DeliveryAddress>>({});

  const validateField = (
    field: keyof DeliveryAddress,
    value: string
  ): string | null => {
    switch (field) {
      case "street":
        if (!value.trim()) return "La dirección es requerida";
        if (value.trim().length < 5)
          return "La dirección debe tener al menos 5 caracteres";
        return null;

      case "city":
        if (!value.trim()) return "La ciudad es requerida";
        if (value.trim().length < 2)
          return "La ciudad debe tener al menos 2 caracteres";
        return null;

      case "state":
        if (value.trim() && value.trim().length < 2)
          return "La provincia debe tener al menos 2 caracteres";
        return null;

      case "zipCode":
        if (value.trim() && !/^\d{5,10}$/.test(value.trim())) {
          return "El código postal debe tener entre 5 y 10 dígitos";
        }
        return null;

      case "country":
        if (!value.trim()) return "El país es requerido";
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryAddress> = {};
    let isValid = true;

    // Validate required fields
    Object.keys(address).forEach((key) => {
      const fieldKey = key as keyof DeliveryAddress;
      const error = validateField(fieldKey, address[fieldKey] || "");
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(address);
    } else {
      Alert.alert(
        "Datos incompletos",
        "Por favor completa todos los campos requeridos correctamente"
      );
    }
  };

  const updateAddress = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate field in real time
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: keyof DeliveryAddress) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, address[field] || "");
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="truck-delivery"
            size={32}
            color={colors.belandOrange}
          />
          <Text style={styles.title}>Dirección de entrega</Text>
          <Text style={styles.subtitle}>
            Completa tu dirección para que podamos entregar tu pedido
          </Text>
        </View>

        <View style={styles.form}>
          {/* Street Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Dirección completa <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                errors.street && touched.street && styles.inputError,
              ]}
            >
              <MaterialCommunityIcons
                name="home-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={address.street}
                onChangeText={(value) => updateAddress("street", value)}
                onBlur={() => handleBlur("street")}
                placeholder="Ej: Av. Amazonas N24-03 y Wilson"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>
            {errors.street && touched.street && (
              <Text style={styles.errorText}>{errors.street}</Text>
            )}
          </View>

          {/* City and State Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                Ciudad <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.city && touched.city && styles.inputError,
                ]}
              >
                <MaterialCommunityIcons
                  name="city"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={address.city}
                  onChangeText={(value) => updateAddress("city", value)}
                  onBlur={() => handleBlur("city")}
                  placeholder="Ej: Quito"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
              {errors.city && touched.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Provincia</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.state && touched.state && styles.inputError,
                ]}
              >
                <MaterialCommunityIcons
                  name="map-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={address.state}
                  onChangeText={(value) => updateAddress("state", value)}
                  onBlur={() => handleBlur("state")}
                  placeholder="Ej: Pichincha"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
              {errors.state && touched.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
              )}
            </View>
          </View>

          {/* Zip Code and Country Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Código Postal</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.zipCode && touched.zipCode && styles.inputError,
                ]}
              >
                <MaterialCommunityIcons
                  name="mailbox-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={address.zipCode}
                  onChangeText={(value) => updateAddress("zipCode", value)}
                  onBlur={() => handleBlur("zipCode")}
                  placeholder="Ej: 170101"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              {errors.zipCode && touched.zipCode && (
                <Text style={styles.errorText}>{errors.zipCode}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                País <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.country && touched.country && styles.inputError,
                ]}
              >
                <MaterialCommunityIcons
                  name="flag-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={address.country}
                  onChangeText={(value) => updateAddress("country", value)}
                  onBlur={() => handleBlur("country")}
                  placeholder="Ecuador"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
              {errors.country && touched.country && (
                <Text style={styles.errorText}>{errors.country}</Text>
              )}
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Información adicional</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address.additionalInfo}
                onChangeText={(value) => updateAddress("additionalInfo", value)}
                placeholder="Ej: Apartamento 3B, referencias, instrucciones especiales..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={colors.belandOrange}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Información de entrega</Text>
              <Text style={styles.infoText}>
                • Tiempo estimado: 2-3 días hábiles{"\n"}• Costo de envío: $5.00
                {"\n"}• Horario de entrega: 9:00 AM - 6:00 PM
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.submitButtonText}>Procesando...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color="white" />
              <Text style={styles.submitButtonText}>Confirmar dirección</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "white",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    paddingHorizontal: 16,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  textArea: {
    paddingTop: 12,
    minHeight: 80,
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3ED",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.belandOrange,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.belandOrange,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
