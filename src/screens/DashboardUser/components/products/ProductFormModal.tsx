import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ProductService } from "@/services/core";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  Category,
} from "@/services/ProductApiService";
import { useNotify } from "@/hooks";

interface ProductFormModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  product,
  onClose,
  onSuccess,
}) => {
  const notify = useNotify();
  const isEditing = !!product;

  // Form state
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    cost: 0,
    price: 0,
    image_url: "",
    category_id: "",
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateProductDto, string>>
  >({});

  // Load form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        cost: product.cost || 0,
        price: product.price,
        image_url: product.image_url || "",
        category_id: product.category_id || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        cost: 0,
        price: 0,
        image_url: "",
        category_id: "",
      });
    }
    setErrors({});
  }, [product]);

  // Load categories
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await ProductService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (
    field: keyof CreateProductDto,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProductDto, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    if (formData.cost < 0) {
      newErrors.cost = "El costo no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      notify.error({ message: "Por favor corrige los errores del formulario" });
      return;
    }

    try {
      setLoading(true);

      if (isEditing && product) {
        await ProductService.updateProduct(
          product.id,
          formData as UpdateProductDto
        );
        notify.success({ message: "Producto actualizado exitosamente" });
      } else {
        await ProductService.createProduct(formData);
        notify.success({ message: "Producto creado exitosamente" });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving product:", error);
      const message =
        error.response?.data?.message || "Error al guardar producto";
      notify.error({ message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Nombre */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Nombre <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Ingresa el nombre del producto"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Descripción */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => handleChange("description", text)}
                placeholder="Ingresa una descripción del producto"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Precios en fila */}
            <View style={styles.row}>
              {/* Costo */}
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Costo (USD)</Text>
                <TextInput
                  style={[styles.input, errors.cost && styles.inputError]}
                  value={formData.cost.toString()}
                  onChangeText={(text) =>
                    handleChange("cost", parseFloat(text) || 0)
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
                {errors.cost && (
                  <Text style={styles.errorText}>{errors.cost}</Text>
                )}
              </View>

              {/* Precio */}
              <View
                style={[
                  styles.formGroup,
                  styles.halfWidth,
                  styles.secondColumn,
                ]}
              >
                <Text style={styles.label}>
                  Precio (USD) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  value={formData.price.toString()}
                  onChangeText={(text) =>
                    handleChange("price", parseFloat(text) || 0)
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
                {errors.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>
            </View>

            {/* Categoría */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoría</Text>
              {loadingCategories ? (
                <ActivityIndicator size="small" color="#7DA244" />
              ) : (
                <View style={styles.selectContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        !formData.category_id && styles.categoryChipActive,
                      ]}
                      onPress={() => handleChange("category_id", "")}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          !formData.category_id &&
                            styles.categoryChipTextActive,
                        ]}
                      >
                        Sin categoría
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          formData.category_id === category.id &&
                            styles.categoryChipActive,
                        ]}
                        onPress={() => handleChange("category_id", category.id)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            formData.category_id === category.id &&
                              styles.categoryChipTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* URL de Imagen */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={formData.image_url}
                onChangeText={(text) => handleChange("image_url", text)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.image_url && (
                <View style={styles.imagePreview}>
                  <Image
                    source={{ uri: formData.image_url }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
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
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? "Actualizar" : "Crear"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  halfWidth: {
    flex: 1,
  },
  secondColumn: {
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  categoriesScroll: {
    padding: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#7DA244",
    borderColor: "#7DA244",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  imagePreview: {
    marginTop: 12,
    alignItems: "center",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#7DA244",
    minWidth: 100,
    alignItems: "center",
    marginLeft: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
