import React, { useState, useEffect, useRef } from "react";
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
import { AddressMapPicker } from "./AddressMapPicker";
import geocodingService from "../../../services/geocodingService";
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
  const isWeb = Platform.OS === "web";
  const [address, setAddress] = useState<DeliveryAddress>(
    initialAddress || {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Ecuador",
      additionalInfo: "",
      phone: "",
    }
  );

  // Close on Escape when running on web
  useEffect(() => {
    if (!isWeb) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWeb, onCancel]);

  const [errors, setErrors] = useState<
    Partial<Record<keyof DeliveryAddress, string | null>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof DeliveryAddress, boolean>>
  >({});
  const streetRef = useRef<any>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ description: string; place_id: string }>
  >([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToastVisible(false);
      toastTimer.current = null;
    }, 2500);
  };

  // Focus first field on web for better keyboard UX
  useEffect(() => {
    if (!isWeb) return;
    setTimeout(() => {
      try {
        streetRef.current?.focus && streetRef.current.focus();
      } catch (e) {
        // ignore
      }
    }, 80);
  }, [isWeb]);

  // Autocomplete handler
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const items = await geocodingService.autocomplete(query);
        setSuggestions(items || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

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
        // Provincia ahora es obligatoria
        if (!value.trim()) return "La provincia es requerida";
        if (value.trim().length < 2)
          return "La provincia debe tener al menos 2 caracteres";
        return null;

      case "zipCode":
        // Código postal obligatorio (libre-formato)
        if (!value.trim()) return "El código postal es requerido";
        return null;

      case "country":
        if (!value.trim()) return "El país es requerido";
        return null;

      case "phone":
        if (!value.trim()) return "El teléfono es requerido";
        // Simple phone validation: mínimo 7 dígitos
        const digits = value.replace(/\D/g, "");
        if (digits.length < 7) return "Ingresa un teléfono válido";
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryAddress, string | null>> = {};
    let isValid = true;

    const requiredFields: (keyof DeliveryAddress)[] = [
      "street",
      "city",
      "state",
      "zipCode",
      "country",
      "phone",
    ];

    requiredFields.forEach((fieldKey) => {
      const raw = address[fieldKey];
      const val =
        typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
      const error = validateField(fieldKey, val);
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    // Mark required fields as touched so inline errors appear after submit
    setTouched((prev) => ({
      ...prev,
      street: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      phone: true,
    }));

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Datos incompletos",
        "Por favor completa todos los campos requeridos correctamente"
      );
      return;
    }

    try {
      // Validate the address via geocoding service (frontend) if available
      const res = await geocodingService.validateAddress({
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.zipCode,
      });

      if (res.ok) {
        onSubmit(address);
        return;
      }

      // If validation failed, offer the user options: correct, use suggested, or submit anyway
      const reason = res.reason || "La dirección no se pudo validar";
      Alert.alert(
        "Validación de dirección",
        reason +
          (res.normalized
            ? "\n\nSe puede usar la dirección sugerida por Google."
            : ""),
        [
          { text: "Corregir", style: "cancel" },
          {
            text: "Usar sugerida",
            onPress: () => {
              if (res.normalized) {
                setAddress((prev) => ({
                  ...prev,
                  street: res.normalized?.street || prev.street,
                  city: res.normalized?.city || prev.city,
                  state: res.normalized?.state || prev.state,
                  zipCode: res.normalized?.postalCode || prev.zipCode,
                  country: res.normalized?.country || prev.country,
                }));
                setIsValidated(true);
              }
            },
          },
          {
            text: "Confirmar de todos modos",
            onPress: () => onSubmit(address),
            style: "destructive",
          },
        ]
      );
    } catch (e) {
      // If the validation call fails (network, key, etc.), allow submit but warn the user
      Alert.alert(
        "Validación no disponible",
        "No fue posible validar la dirección en este momento. Puedes confirmar de todos modos.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Confirmar de todos modos",
            onPress: () => onSubmit(address),
          },
        ]
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
    const raw = address[field];
    const val =
      typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
    const error = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <View style={isWeb ? styles.webContainer : undefined}>
      <KeyboardAvoidingView
        style={[styles.container, isWeb && styles.webInnerContainer]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Toast: aparece temporalmente cuando una dirección se autocompleta */}
        {toastVisible && (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
        {isWeb && (
          <TouchableOpacity
            accessibilityLabel="Cerrar"
            style={styles.webCloseButton}
            onPress={onCancel}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        <View style={isWeb ? styles.webPanel : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
            style={isWeb ? styles.scrollArea : undefined}
          >
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
                    ref={streetRef}
                    value={address.street}
                    onChangeText={(value) => {
                      updateAddress("street", value);
                      setQuery(value);
                      setIsValidated(false);
                    }}
                    onBlur={() => handleBlur("street")}
                    placeholder="Ej: Av. Amazonas N24-03 y Wilson"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />

                  {/* Map picker button */}
                  <TouchableOpacity
                    accessibilityLabel="Seleccionar ubicación en el mapa"
                    onPress={() => setMapPickerVisible(true)}
                    style={{ marginLeft: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={22}
                      color={colors.belandOrange}
                    />
                  </TouchableOpacity>
                </View>
                {errors.street && touched.street && (
                  <Text style={styles.errorText}>{errors.street}</Text>
                )}
                {/* Suggestions dropdown */}
                {suggestions.length > 0 && query.trim().length >= 2 && (
                  <View style={styles.suggestionsContainer}>
                    {suggestions.map((s) => (
                      <TouchableOpacity
                        key={s.place_id}
                        style={styles.suggestionItem}
                        onPress={async () => {
                          // fill fields from place details
                          const details =
                            await geocodingService.getPlaceDetails(s.place_id);
                          if (details) {
                            setAddress((prev) => ({
                              ...prev,
                              street: details.street || prev.street,
                              city: details.city || prev.city,
                              state: details.state || prev.state,
                              zipCode: details.postalCode || prev.zipCode,
                              country: details.country || prev.country,
                              latitude: details.lat ?? prev.latitude,
                              longitude: details.lng ?? prev.longitude,
                            }));
                            setSuggestions([]);
                            setQuery("");
                            setIsValidated(true);
                            // mark touched so validation updates
                            setTouched((prev) => ({
                              ...prev,
                              street: true,
                              city: true,
                              state: true,
                              zipCode: true,
                              country: true,
                            }));
                            showToast("Dirección autocompletada");
                          }
                        }}
                      >
                        <Text style={styles.suggestionText}>
                          {s.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {/* Mostrar coordenadas seleccionadas si existen */}
                {address.latitude && address.longitude && (
                  <Text style={{ color: "#666", marginTop: 6, marginLeft: 6 }}>
                    Ubicación seleccionada: {address.latitude.toFixed(6)},{" "}
                    {address.longitude.toFixed(6)}
                  </Text>
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
              {/* Phone number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Teléfono <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.phone && touched.phone && styles.inputError,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="phone"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={String(address.phone || "")}
                    onChangeText={(value) => updateAddress("phone", value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="Ej: +593 98 765 4321"
                    placeholderTextColor="#999"
                    keyboardType={
                      Platform.OS === "web" ? "default" : "phone-pad"
                    }
                  />
                </View>
                {errors.phone && touched.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

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
                    onChangeText={(value) =>
                      updateAddress("additionalInfo", value)
                    }
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
                    • Tiempo estimado: 2-3 días hábiles{"\n"}• Costo de envío:
                    $5.00
                    {"\n"}• Horario de entrega: 9:00 AM - 6:00 PM
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[styles.actionButtons, isWeb && styles.webActionButtons]}
          >
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
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.submitButtonText}>
                    Confirmar dirección
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Map picker modal */}
      <AddressMapPicker
        visible={mapPickerVisible}
        onClose={() => setMapPickerVisible(false)}
        initial={
          address.latitude && address.longitude
            ? { latitude: address.latitude, longitude: address.longitude }
            : null
        }
        onSelect={(coords) => {
          // When user selects coords from the picker, try reverse-geocoding to fill address
          (async () => {
            try {
              const normalized = await geocodingService.reverseGeocode(
                coords.latitude,
                coords.longitude
              );
              setAddress((prev) => ({
                ...prev,
                latitude: coords.latitude,
                longitude: coords.longitude,
                street: normalized?.street || prev.street,
                city: normalized?.city || prev.city,
                state: normalized?.state || prev.state,
                zipCode: normalized?.postalCode || prev.zipCode,
                country: normalized?.country || prev.country,
              }));
              // mark fields touched so errors update
              setTouched((prev) => ({
                ...prev,
                street: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
              }));
              if (normalized)
                showToast("Dirección autocompletada desde el mapa");
            } catch (e) {
              // if reverse geocode fails, still set coords
              setAddress((prev) => ({
                ...prev,
                latitude: coords.latitude,
                longitude: coords.longitude,
              }));
              showToast("Ubicación seleccionada");
            } finally {
              setMapPickerVisible(false);
            }
          })();
        }}
      />
    </View>
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
    // Remove default border to avoid browser-native black outlines on focus
    borderWidth: 0,
    borderColor: "transparent",
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
    // Remove web default focus outline (React Native for Web will map this)
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  textArea: {
    paddingTop: 12,
    minHeight: 80,
  },
  inputError: {
    // Highlight error state without showing a border
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
  // Web-specific styles
  webContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 1000,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 16,
  },
  webInnerContainer: {
    width: "100%",
    height: "100%",
    maxWidth: 720,
    backgroundColor: "transparent",
  },
  webPanel: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    maxHeight: "92%",
  },
  scrollArea: {
    flexGrow: 1,
    maxHeight: "75%",
  },
  webCloseButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 1010,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    elevation: 6,
  },
  webActionButtons: {
    paddingHorizontal: 28,
    paddingVertical: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    width: "100%",
  },
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    overflow: "hidden",
    elevation: 6,
    zIndex: 2000,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  suggestionText: {
    color: colors.textPrimary,
  },
  toast: {
    position: "absolute",
    top: 12,
    left: 24,
    right: 24,
    zIndex: 2000,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  toastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
