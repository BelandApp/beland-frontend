import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, MapPin, Plus, Trash2, Check, Home } from "lucide-react-native";
import { useAddresses } from "src/hooks/useAddresses";
import type {
  UserAddress,
  CreateAddressRequest,
} from "src/services/addressService";

interface AddressManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddressManagementModal: React.FC<AddressManagementModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    addresses,
    loading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [formData, setFormData] = useState<CreateAddressRequest>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Paraguay",
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Paraguay",
      isDefault: false,
    });
    setFormErrors([]);
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que deseas eliminar esta dirección?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const success = await deleteAddress(addressId);
            if (success) {
              Alert.alert("Éxito", "Dirección eliminada correctamente");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    const success = await setDefaultAddress(addressId);
    if (success) {
      Alert.alert("Éxito", "Dirección predeterminada actualizada");
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.addressLine1.trim()) {
      errors.push("La dirección es obligatoria");
    }
    if (!formData.city.trim()) {
      errors.push("La ciudad es obligatoria");
    }
    if (!formData.country.trim()) {
      errors.push("El país es obligatorio");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (editingAddress) {
      // Actualizar dirección existente
      const success = await updateAddress(editingAddress.id, formData);
      if (success) {
        Alert.alert("Éxito", "Dirección actualizada correctamente");
        resetForm();
      }
    } else {
      // Crear nueva dirección
      const newAddress = await createAddress(formData);
      if (newAddress) {
        Alert.alert("Éxito", "Dirección agregada correctamente");
        resetForm();
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MapPin size={24} color="#FF6B35" />
              <Text style={styles.title}>Mis Direcciones</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {!showAddForm ? (
              <>
                {/* Add Button */}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddForm(true)}
                  disabled={loading}
                >
                  <Plus size={20} color="#FF6B35" />
                  <Text style={styles.addButtonText}>
                    Agregar Nueva Dirección
                  </Text>
                </TouchableOpacity>

                {/* Address List */}
                {loading && addresses.length === 0 ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                  </View>
                ) : addresses.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MapPin size={48} color="#999" />
                    <Text style={styles.emptyText}>
                      No tienes direcciones guardadas
                    </Text>
                    <Text style={styles.emptyHint}>
                      Agrega una dirección para facilitar tus compras
                    </Text>
                  </View>
                ) : (
                  <View style={styles.addressList}>
                    {addresses.map((address) => (
                      <View key={address.id} style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                          <View style={styles.addressHeaderLeft}>
                            <Home size={18} color="#FF6B35" />
                            {address.isDefault && (
                              <View style={styles.defaultBadge}>
                                <Check size={12} color="#4CAF50" />
                                <Text style={styles.defaultText}>
                                  Predeterminada
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.addressActions}>
                            <TouchableOpacity
                              onPress={() => handleEdit(address)}
                              style={styles.actionButton}
                            >
                              <Text style={styles.editText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDelete(address.id)}
                              style={styles.actionButton}
                            >
                              <Trash2 size={16} color="#F44336" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Text style={styles.addressText}>
                          {address.addressLine1}
                        </Text>
                        {address.addressLine2 && (
                          <Text style={styles.addressText}>
                            {address.addressLine2}
                          </Text>
                        )}
                        <Text style={styles.addressText}>
                          {address.city}
                          {address.state && `, ${address.state}`}
                          {address.postalCode && ` ${address.postalCode}`}
                        </Text>
                        <Text style={styles.addressText}>
                          {address.country}
                        </Text>

                        {!address.isDefault && (
                          <TouchableOpacity
                            style={styles.setDefaultButton}
                            onPress={() => handleSetDefault(address.id)}
                          >
                            <Text style={styles.setDefaultText}>
                              Establecer como predeterminada
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Add/Edit Form */}
                <View style={styles.form}>
                  <Text style={styles.formTitle}>
                    {editingAddress ? "Editar Dirección" : "Nueva Dirección"}
                  </Text>

                  {formErrors.length > 0 && (
                    <View style={styles.errorContainer}>
                      {formErrors.map((error, index) => (
                        <Text key={index} style={styles.errorText}>
                          • {error}
                        </Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Dirección <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={formData.addressLine1}
                      onChangeText={(text) =>
                        setFormData({ ...formData, addressLine1: text })
                      }
                      placeholder="Calle, número, colonia"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Detalles adicionales (opcional)
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={formData.addressLine2}
                      onChangeText={(text) =>
                        setFormData({ ...formData, addressLine2: text })
                      }
                      placeholder="Departamento, piso, referencia"
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>
                        Ciudad <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={formData.city}
                        onChangeText={(text) =>
                          setFormData({ ...formData, city: text })
                        }
                        placeholder="Ciudad"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Departamento (opcional)</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.state}
                        onChangeText={(text) =>
                          setFormData({ ...formData, state: text })
                        }
                        placeholder="Departamento"
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Código Postal (opcional)</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.postalCode}
                        onChangeText={(text) =>
                          setFormData({ ...formData, postalCode: text })
                        }
                        placeholder="0000"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>
                        País <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={formData.country}
                        onChangeText={(text) =>
                          setFormData({ ...formData, country: text })
                        }
                        placeholder="País"
                      />
                    </View>
                  </View>
                </View>

                {/* Form Actions */}
                <View style={styles.formFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetForm}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      loading && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {editingAddress ? "Actualizar" : "Guardar"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B35",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  addressList: {
    gap: 12,
  },
  addressCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4CAF50",
  },
  addressActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  editText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  setDefaultText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  form: {
    gap: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#F44336",
  },
  optional: {
    color: "#999",
    fontWeight: "400",
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#F9F9F9",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  formFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#FF6B35",
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
