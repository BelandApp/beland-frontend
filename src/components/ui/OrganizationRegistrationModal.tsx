import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Building2, Mail, Phone, MapPin, Globe } from "lucide-react-native";
import { toastConfig } from "src/components/shared/notification/GlobalNotification";

export interface MerchantFormData {
  name: string;
  legal_name?: string;
  ruc?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
}
import * as mapboxService from "src/services/mapboxService";
import type { MapboxSuggestion } from "src/services/mapboxService";
import Toast from "react-native-toast-message";

interface OrganizationRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: MerchantFormData) => Promise<void>;
  isLoading?: boolean;
}

export const OrganizationRegistrationModal: React.FC<
  OrganizationRegistrationModalProps
> = ({ visible, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<MerchantFormData>({
    name: "",
    legal_name: "",
    ruc: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    country: "",
    website: "",
  });

  // Mapbox autocomplete states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const debounceRef = useRef<number | null>(null);

  // Debounced suggestions effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const results = await mapboxService.searchAddressSuggestions(
          searchQuery,
          {
            language: "es",
            limit: 5,
          }
        );
        setSuggestions(results || []);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300) as unknown as number;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field: name (2-150 characters)
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "El nombre es requerido (mínimo 2 caracteres)";
    } else if (formData.name.trim().length > 150) {
      newErrors.name = "El nombre no puede exceder 150 caracteres";
    }

    // Optional but validated fields
    if (formData.email && formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email inválido";
      }
    }

    if (formData.phone && formData.phone.trim()) {
      if (formData.phone.trim().length < 5) {
        newErrors.phone = "El teléfono debe tener al menos 5 caracteres";
      }
    }

    // Address fields are required for merchant creation (address_id)
    if (!formData.address || !formData.address.trim()) {
      newErrors.address = "La dirección es requerida";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "La dirección debe tener al menos 5 caracteres";
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = "La ciudad es requerida";
    } else if (formData.city.trim().length < 2) {
      newErrors.city = "La ciudad debe tener al menos 2 caracteres";
    }

    if (!formData.country || !formData.country.trim()) {
      newErrors.country = "El país es requerido";
    }

    if (formData.website && formData.website.trim()) {
      if (
        !formData.website.startsWith("http://") &&
        !formData.website.startsWith("https://")
      ) {
        newErrors.website = "El sitio web debe comenzar con http:// o https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: "",
        legal_name: "",
        ruc: "",

        description: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        province: "",
        country: "",
        website: "",
      });
      setErrors({});
    } catch (error: any) {
      // Show toast with backend error message and keep form values
      const msg =
        error?.message ||
        error?.details?.message ||
        (Array.isArray(error?.details?.message)
          ? error.details.message.join(", ")
          : undefined) ||
        "Error al crear el comercio";
      Toast.show({
        type: "error",
        text1: String(msg),
        position: "top",
        topOffset: 60,
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View className=" absolute right-60 top-0">
          <Toast config={toastConfig} />
        </View>

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Building2 size={24} color="#FF6B35" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Registrar mi Organización</Text>
                <Text style={styles.subtitle}>
                  Completa la información de tu negocio para convertirte en
                  comerciante
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                disabled={isLoading}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.form}>
                {/* Required Fields Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Información Básica <Text style={styles.required}>*</Text>
                  </Text>

                  <View
                    style={[styles.inputContainer, styles.suggestionsWrapper]}
                  >
                    <Text style={styles.label}>
                      Nombre del Negocio <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      placeholder="Ej: Mi Comercio Beland"
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, name: text })
                      }
                      editable={!isLoading}
                    />
                    {errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                  </View>
                </View>

                {/* Legal Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Información Legal (Opcional)
                  </Text>

                  <View
                    style={[styles.inputContainer, styles.suggestionsWrapper]}
                  >
                    <Text style={styles.label}>Razón Social</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre legal de la empresa"
                      value={formData.legal_name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, legal_name: text })
                      }
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>RUC</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Número de RUC"
                      value={formData.ruc}
                      onChangeText={(text) =>
                        setFormData({ ...formData, ruc: text })
                      }
                      keyboardType="numeric"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Describe tu negocio"
                      value={formData.description}
                      onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
                      }
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contacto (Opcional)</Text>

                  <View
                    style={[styles.inputContainer, styles.suggestionsWrapper]}
                  >
                    <View style={styles.labelWithIcon}>
                      <Phone size={16} color="#666" />
                      <Text style={styles.label}>
                        Teléfono (mín. 5 caracteres)
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.phone && styles.inputError]}
                      placeholder="Ej: 0981234567"
                      value={formData.phone}
                      onChangeText={(text) =>
                        setFormData({ ...formData, phone: text })
                      }
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                    {errors.phone && (
                      <Text style={styles.errorText}>{errors.phone}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.labelWithIcon}>
                      <Mail size={16} color="#666" />
                      <Text style={styles.label}>Email</Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="contacto@ejemplo.com"
                      value={formData.email}
                      onChangeText={(text) =>
                        setFormData({ ...formData, email: text })
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.labelWithIcon}>
                      <Globe size={16} color="#666" />
                      <Text style={styles.label}>
                        Sitio Web (debe incluir http:// o https://)
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.website && styles.inputError,
                      ]}
                      placeholder="https://ejemplo.com"
                      value={formData.website}
                      onChangeText={(text) =>
                        setFormData({ ...formData, website: text })
                      }
                      keyboardType="url"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    {errors.website && (
                      <Text style={styles.errorText}>{errors.website}</Text>
                    )}
                  </View>
                </View>

                {/* Location Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ubicación </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.labelWithIcon}>
                      <MapPin size={16} color="#666" />
                      <Text style={styles.label}>
                        Dirección (mín. 5 caracteres)
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.address && styles.inputError,
                      ]}
                      placeholder="Calle, número, barrio"
                      value={formData.address}
                      onChangeText={(text) => {
                        setFormData({ ...formData, address: text });
                        setSearchQuery(text);
                      }}
                      editable={!isLoading}
                    />

                    {suggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        {suggestions.map((s) => (
                          <TouchableOpacity
                            key={s.id}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setFormData((prev) => ({
                                ...prev,
                                address: s.name || s.full_address,
                                city:
                                  s.context?.place?.name ||
                                  s.context?.locality?.name ||
                                  s.context?.region?.name ||
                                  "",
                                province: s.context?.region?.name || "",
                                country: s.context?.country?.name || "",
                              }));
                              setSuggestions([]);
                              setSearchQuery("");
                            }}
                          >
                            <Text style={styles.suggestionText}>
                              {s.full_address}
                            </Text>
                            <Text
                              style={styles.suggestionSubText}
                              numberOfLines={1}
                            >
                              {s.context?.region?.name ||
                                s.context?.country?.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {errors.address && (
                      <Text style={styles.errorText}>{errors.address}</Text>
                    )}
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Text style={styles.label}>
                        Ciudad (mín. 2 caracteres)
                      </Text>
                      <TextInput
                        style={[styles.input, errors.city && styles.inputError]}
                        placeholder="Ej: Pichincha"
                        value={formData.city}
                        onChangeText={(text) =>
                          setFormData({ ...formData, city: text })
                        }
                        editable={!isLoading}
                      />
                      {errors.city && (
                        <Text style={styles.errorText}>{errors.city}</Text>
                      )}
                    </View>

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                      <Text style={styles.label}>
                        Departamento (mín. 2 caracteres)
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          errors.province && styles.inputError,
                        ]}
                        placeholder="Ej: Ecuador"
                        value={formData.province}
                        onChangeText={(text) =>
                          setFormData({ ...formData, province: text })
                        }
                        editable={!isLoading}
                      />
                      {errors.province && (
                        <Text style={styles.errorText}>{errors.province}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>País</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ecuador"
                      value={formData.country}
                      onChangeText={(text) =>
                        setFormData({ ...formData, country: text })
                      }
                      editable={!isLoading}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Registrar Organización
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 600,
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#F9F9F9",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE8E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  required: {
    color: "#E53935",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  inputError: {
    borderColor: "#E53935",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
    backgroundColor: "#F9F9F9",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#FF6B35",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  suggestionsWrapper: {
    position: "relative",
  },
  suggestionsContainer: {
    position: "relative",
    zIndex: 2000,
    maxHeight: 275,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  suggestionSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
