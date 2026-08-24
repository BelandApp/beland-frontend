import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ProductService } from "@/services/core";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  Category,
} from "@/services/ProductApiService";
import { useNotify, useBeCoinsPrice, useUploadMedia } from "@/hooks";
import {
  Button,
  CustomInput,
  CustomLoader,
  WrapperModal,
} from "src/components";
import { colors } from "src/design-system";

import { CloudinaryService } from "src/services";
import { ImagePlus, X } from "lucide-react-native";

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
  const { usdToBeCoins } = useBeCoinsPrice();
  const isEditing = !!product;

  // Form state
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    cost: 0,
    price: 0,
    image_url: "",
    category_id: "",
    quantity: 0,
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateProductDto, string>>
  >({});
  const { pickMedia, clearMedia, previewUri, media, appendToFormData } =
    useUploadMedia();
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
        quantity: product.stock,
        is_circular: product.is_circular || false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        cost: 0,
        price: 0,
        image_url: "",
        category_id: "",
        quantity: 0,
        is_circular: false,
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      notify.error({ message: "El nombre de la categoría es requerido" });
      return;
    }

    try {
      setCreatingCategory(true);
      await ProductService.createCategory({
        name: newCategoryName.trim(),
      });
      notify.success({ message: "Categoría creada exitosamente" });
      setShowCategoryModal(false);
      setNewCategoryName("");
      await loadCategories();
    } catch (error: any) {
      console.error("Error creating category:", error);
      const message =
        error.response?.data?.message || "Error al crear categoría";
      notify.error({ message });
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleChange = <K extends keyof CreateProductDto>(
    field: K,
    value: CreateProductDto[K],
  ) => {
    let finalValue = value;

    if (typeof finalValue === "string" && finalValue.includes(",")) {
      finalValue = finalValue.replace(",", ".") as CreateProductDto[K];
    }

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
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
      let payload = { ...formData };
      if (media) {
        const formImage = new FormData();
        appendToFormData(formImage);
        const new_image_url = await CloudinaryService.uploadImage(formImage);
        payload = {
          ...payload,
          image_url: new_image_url,
        };
      }
      if (isEditing && product) {
        await ProductService.updateProduct(
          product.id,
          payload as UpdateProductDto,
        );
        notify.success({ message: "Producto actualizado exitosamente" });
      } else {
        await ProductService.createProduct(payload);
        notify.success({ message: "Producto creado exitosamente" });
      }
      setFormData(payload);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving product:", error);
      const message =
        error.response?.data?.message || "Error al guardar producto";
      notify.error({ message });
    } finally {
      clearMedia();
      setLoading(false);
    }
  };
  const handleClose = () => {
    clearMedia();
    setFormData({
      name: "",
      description: "",
      cost: 0,
      price: 0,
      image_url: "",
      category_id: "",
      quantity: 0,
    });
    onClose();
  };
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
      <WrapperModal
        beforeClose={handleBeforeClose}
        isOpen={visible}
        onClose={handleClose}
        header={
          <Text style={styles.modalTitle}>
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </Text>
        }
        content={
          <View>
            <View style={styles.row}>
              <CustomInput
                label="Nombre"
                required
                variant="filled"
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
                error={errors.name}
              />
              <CustomInput
                label="Stock"
                required
                variant="filled"
                value={String(formData.quantity)}
                keyboardType="decimal-pad"
                onChangeText={(value) =>
                  handleChange("quantity", Number(value))
                }
                error={errors.quantity}
              />
            </View>
            <CustomInput
              label="Descripción"
              required
              variant="filled"
              value={formData.description ?? ""}
              onChangeText={(text) => handleChange("description", text)}
              error={errors.description}
            />

            {/* Precios en fila */}
            <View style={styles.row}>
              <CustomInput
                required
                variant="filled"
                keyboardType="decimal-pad"
                label="Costo (USD)"
                value={formData.cost.toString()}
                onChangeText={(num) => handleChange("cost", Number(num))}
                error={errors.cost}
              />
              <CustomInput
                required
                variant="filled"
                keyboardType="decimal-pad"
                label="Precio (USD)"
                value={formData.price.toString()}
                onChangeText={(num) => handleChange("price", Number(num))}
                error={errors.price}
              />
            </View>
            <View className="flex flex-row items-center gap-2">
              <span>El producto es circular?</span>
              <Button
                title="Si"
                variant={formData.is_circular ? "primary" : "ghost"}
                onPress={() => handleChange("is_circular", true)}
              />
              <Button
                title="No"
                variant={formData.is_circular ? "ghost" : "primary"}
                onPress={() => handleChange("is_circular", false)}
              />
            </View>

            {/* Precio Becoins (Calculado automáticamente) */}
            {formData.price > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Precio en Becoins (Calculado automáticamente)
                </Text>
                <View style={styles.becoinsPreviewContainer}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={24}
                    color={colors.brand.green[500]}
                  />
                  <Text style={styles.becoinsPreviewText}>
                    {usdToBeCoins(formData.price).toFixed(2)} BC
                  </Text>
                </View>
                <View style={styles.helperTextContainer}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={14}
                    color="#6b7280"
                  />
                  <Text style={styles.helperText}>
                    El precio en Becoins se calcula automáticamente según la
                    tasa de conversión configurada por el superadmin.
                  </Text>
                </View>
              </View>
            )}

            {/* Categoría */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Categoría</Text>

                <Button
                  variant="box"
                  title="Agregar categoría"
                  onPress={() => setShowCategoryModal(true)}
                  icon={
                    <MaterialCommunityIcons
                      name="plus-circle"
                      size={16}
                      color="orange"
                    />
                  }
                />
              </View>
              {loadingCategories ? (
                <CustomLoader title="Cargando categorías" />
              ) : (
                <View style={styles.categoriesGrid}>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      !formData.category_id && styles.categoryButtonActive,
                    ]}
                    onPress={() => handleChange("category_id", "")}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        !formData.category_id &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      Sin categoría
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        formData.category_id === category.id &&
                          styles.categoryButtonActive,
                      ]}
                      onPress={() => handleChange("category_id", category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          formData.category_id === category.id &&
                            styles.categoryButtonTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {/* URL de Imagen */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>URL de Imagen</Text>
                <Button
                  title={formData.image_url ? "Cambiar imagen" : "Subir Image"}
                  onPress={() => pickMedia({ mediaType: "images" })}
                  className="w-fit"
                  variant="box"
                  icon={<ImagePlus color="orange" size={16} />}
                />
              </View>
              <View style={[styles.row, { marginHorizontal: "auto" }]}>
                {formData.image_url && (
                  <View style={styles.imagePreview}>
                    <Text>Anterior Imagen</Text>
                    <Image
                      source={{ uri: formData.image_url }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                {previewUri && (
                  <View style={styles.imagePreview}>
                    <Text>Nueva Imagen </Text>
                    <Image
                      source={{ uri: previewUri }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        }
        actions={
          <View className="flex-row gap-2 mx-auto">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              disabled={loading}
            />
            <Button
              title={isEditing ? "Actualizar" : "Crear"}
              onPress={handleSubmit}
              disabled={loading}
            />
          </View>
        }
      />
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.categoryModalOverlay}>
          <View style={styles.categoryModalContent}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Nueva Categoría</Text>
              <Button
                variant="onlyIcon"
                icon={<X color={colors.brand.orange[500]} size={24} />}
                onPress={() => setShowCategoryModal(false)}
                title="cerrar"
              />
            </View>
            <CustomInput
              label="Nombre"
              variant="filled"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Ingresa el nombre de la categoría"
              required
              autoFocus
            />

            <View style={styles.categoryModalFooter}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                }}
                disabled={creatingCategory}
              />

              <Button
                title={creatingCategory ? "Procesando " : "Crear Categoria"}
                onPress={handleCreateCategory}
                disabled={creatingCategory}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 2000,
  },
  categoryModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    gap: 8,
    padding: 16,
  },
  categoryModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  categoryModalBody: {
    padding: 20,
  },
  categoryModalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
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
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  secondColumn: {
    marginLeft: 12,
  },
  label: {
    fontSize: 18,
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
  conversionBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  conversionText: {
    fontSize: 12,
    color: "#7DA244",
    fontWeight: "600",
    marginLeft: 4,
  },
  helperTextContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
  becoinsPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand.orange[100],
    borderWidth: 1,
    borderColor: colors.brand.orange[200],
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
  },
  becoinsPreviewText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.brand.orange[500],
    marginLeft: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    width: "30%",
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: colors.brand.orange[500],
  },
  categoryButtonText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
    marginVertical: "auto",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },

  imagePreview: {
    alignItems: "center",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
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
