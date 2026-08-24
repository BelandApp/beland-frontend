import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type {
  UpdateProductDto,
  Experience,
  CreateExperienceDto,
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
import { ImagePlus, VideoIcon, X } from "lucide-react-native";
import { ExperienceService } from "src/services/experience/ExperienceApiService";

interface ExperienceFormModalProps {
  visible: boolean;
  experience: Experience | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExperienceFormModal: React.FC<ExperienceFormModalProps> = ({
  visible,
  experience,
  onClose,
  onSuccess,
}) => {
  const notify = useNotify();
  const { usdToBeCoins } = useBeCoinsPrice();
  const isEditing = !!experience;

  // 1. Instanciamos el hook DOS VECES (uno para imagen, otro para video)
  const imageUpload = useUploadMedia();
  const videoUpload = useUploadMedia();

  // Form state
  const [formData, setFormData] = useState<CreateExperienceDto>({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    video_url: "",
    creator: "",
    tags: [],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateExperienceDto, string>>
  >({});

  // Cargar datos al editar o limpiar al crear
  useEffect(() => {
    if (experience) {
      setFormData({
        name: experience.name,
        description: experience.description || "",
        price: experience.price || 0,
        image_url: experience.image_url || "",
        video_url: experience.video_url || "",
        creator: experience.creator || "",
        tags: experience.tags || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        image_url: "",
        video_url: "",
        creator: "",
        tags: [],
      });
    }
    setErrors({});
    imageUpload.clearMedia();
    videoUpload.clearMedia();
  }, [experience]);

  const handleChange = <K extends keyof CreateExperienceDto>(
    field: K,
    value: CreateExperienceDto[K],
  ) => {
    let finalValue = value;

    if (typeof finalValue === "string" && finalValue.includes(",")) {
      finalValue = finalValue.replace(",", ".") as CreateExperienceDto[K];
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
    const newErrors: Partial<Record<keyof CreateExperienceDto, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
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

      // 2. Subida independiente de Imagen
      if (imageUpload.media) {
        const formImage = new FormData();
        imageUpload.appendToFormData(formImage, "file");
        const new_image_url = await CloudinaryService.uploadImage(formImage);
        payload.image_url = new_image_url;
      }

      // 3. Subida independiente de Video
      if (videoUpload.media) {
        const formVideo = new FormData();
        videoUpload.appendToFormData(formVideo, "file");
        // Asegúrate de tener implementado uploadVideo en CloudinaryService
        const new_video_url = await CloudinaryService.uploadVideo(formVideo);
        payload.video_url = new_video_url;
      }

      if (isEditing && experience) {
        await ExperienceService.updateExperience(
          experience.id,
          payload as UpdateProductDto,
        );
        notify.success({ message: "Experiencia actualizada exitosamente" });
      } else {
        await ExperienceService.createExperience(payload);
        notify.success({ message: "Experiencia creada exitosamente" });
      }

      setFormData(payload);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving experience:", error);
      const message =
        error.response?.data?.message || "Error al guardar la Experiencia";
      notify.error({ message });
    } finally {
      imageUpload.clearMedia();
      videoUpload.clearMedia();
      setLoading(false);
    }
  };

  const handleClose = () => {
    imageUpload.clearMedia();
    videoUpload.clearMedia();
    setFormData({
      name: "",
      description: "",
      price: 0,
      image_url: "",
      video_url: "",
      creator: "",
      tags: [],
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
    <WrapperModal
      beforeClose={handleBeforeClose}
      isOpen={visible}
      onClose={handleClose}
      header={
        <Text style={styles.modalTitle}>
          {isEditing ? "Editar Experiencia" : "Nueva Experiencia"}
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
          </View>
          <CustomInput
            label="Descripción"
            required
            variant="filled"
            value={formData.description ?? ""}
            onChangeText={(text) => handleChange("description", text)}
            error={errors.description}
          />

          <View style={styles.row}>
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
            </View>
          )}

          {/* SECCIÓN 1: SUBIR IMAGEN */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Imagen de la Experiencia</Text>
              <Button
                title={
                  formData.image_url || imageUpload.previewUri
                    ? "Cambiar imagen"
                    : "Subir Imagen"
                }
                onPress={() => imageUpload.pickMedia({ mediaType: "images" })}
                className="w-fit"
                variant="box"
                icon={<ImagePlus color="orange" size={16} />}
              />
            </View>
            <View style={[styles.row, { marginHorizontal: "auto" }]}>
              {formData.image_url && !imageUpload.previewUri && (
                <View style={styles.imagePreview}>
                  <Text>Imagen Actual</Text>
                  <Image
                    source={{ uri: formData.image_url }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                </View>
              )}
              {imageUpload.previewUri && (
                <View style={styles.imagePreview}>
                  <Text>Nueva Imagen</Text>
                  <Image
                    source={{ uri: imageUpload.previewUri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </View>

          {/* SECCIÓN 2: SUBIR VIDEO */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Video de la Experiencia</Text>
              <Button
                title={
                  formData.video_url || videoUpload.previewUri
                    ? "Cambiar Video"
                    : "Subir Video"
                }
                onPress={() => videoUpload.pickMedia({ mediaType: "videos" })}
                className="w-fit"
                variant="box"
                icon={<VideoIcon color="orange" size={16} />}
              />
            </View>
            <View style={[styles.row, { marginHorizontal: "auto" }]}>
              {formData.video_url && !videoUpload.previewUri && (
                <View style={styles.imagePreview}>
                  <Text>Video Actual</Text>
                  {Platform.OS === "web" ? (
                    <video
                      src={formData.video_url}
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                      controls
                    />
                  ) : (
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                      Video cargado
                    </Text>
                  )}
                </View>
              )}
              {videoUpload.previewUri && (
                <View style={styles.imagePreview}>
                  <Text>Nuevo Video</Text>
                  {Platform.OS === "web" ? (
                    <video
                      src={videoUpload.previewUri}
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                      controls
                    />
                  ) : (
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                      Video listo para subir
                    </Text>
                  )}
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
            onPress={handleClose}
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
