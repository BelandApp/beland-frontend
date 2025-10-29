import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useCustomAlert } from "src/hooks";
import { CustomAlert } from "src/components/ui/CustomAlert";
import IntuitiveDatePicker from "src/components/ui/IntuitiveDatePicker";
import { compressImages } from "src/utils/imageCompression";
import {
  CreateEventPassDto,
  EventPass,
  EventPassType,
  adminApiService,
} from "src/services/AdminApiService";

interface EventFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (event: EventPass) => void;
  editingEvent?: EventPass | null;
  eventTypes: EventPassType[];
  eventTypesError?: string | null;
}

// Componente para mostrar inputs con validación en línea
const InputWithError = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  multiline = false,
  keyboardType = "default" as any,
  editable = true,
  loading = false,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  editable?: boolean;
  loading?: boolean;
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.textArea,
        error && styles.inputError,
        !editable && styles.inputDisabled,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      placeholderTextColor="#999"
      editable={editable && !loading}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Componente para selector con validación
const SelectorWithError = ({
  label,
  value,
  options,
  onSelect,
  error,
  placeholder = "Seleccionar...",
  loading = false,
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onSelect: (value: string) => void;
  error?: string;
  placeholder?: string;
  loading?: boolean;
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    {options.length === 0 ? (
      <View style={[styles.selector, styles.selectorDisabled]}>
        <Text style={styles.placeholderText}>
          🔄 Cargando tipos de evento...
        </Text>
      </View>
    ) : (
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.pickerOption,
              value === option.id && styles.pickerOptionSelected,
            ]}
            onPress={() => onSelect(option.id)}
            disabled={loading}
          >
            <Text
              style={[
                styles.pickerOptionText,
                value === option.id && styles.pickerOptionTextSelected,
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const EventFormModal: React.FC<EventFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editingEvent,
  eventTypes,
  eventTypesError,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  // Generar código automático
  const generateEventCode = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    return `EVT-${year}${month}${day}-${hour}${minute}`;
  };

  const [formData, setFormData] = useState<CreateEventPassDto>({
    code: generateEventCode(),
    name: "",
    description: "",
    type_id: "",
    event_place: "",
    event_city: "",
    event_date: new Date(),
    limit_tickets: 100,
    price_becoin: 0,
    discount: 0,
    is_refundable: true,
    refund_days_limit: 3,
    is_active: true,
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        code: editingEvent.code,
        name: editingEvent.name,
        description: editingEvent.description || "",
        // Usar el type_id que ya tenga el evento si existe, si no caer al primer tipo disponible
        type_id: (editingEvent as any).type_id || eventTypes[0]?.id || "",
        event_place: editingEvent.event_place || "",
        event_city: editingEvent.event_city || "",
        event_date: new Date(editingEvent.event_date),
        limit_tickets: editingEvent.limit_tickets,
        // editingEvent.price_becoin puede venir como string desde el backend -> convertir a number
        price_becoin:
          parseFloat((editingEvent as any).price_becoin as any) || 0,
        discount: 0, // Valor por defecto ya que no está en EventPass
        is_refundable: true, // Valor por defecto ya que no está en EventPass
        refund_days_limit: 3, // Valor por defecto ya que no está en EventPass
        is_active: editingEvent.is_active,
      });
      // Cargar imágenes existentes del evento en el preview (image_url primero, luego images_urls)
      const existingImages: string[] = [];
      if ((editingEvent as any).image_url)
        existingImages.push((editingEvent as any).image_url);
      if (
        Array.isArray((editingEvent as any).images_urls) &&
        (editingEvent as any).images_urls.length > 0
      ) {
        existingImages.push(
          ...(editingEvent as any).images_urls.filter(Boolean)
        );
      }
      setSelectedImages(existingImages);
    } else {
      resetForm();
    }
    setErrors({});
  }, [editingEvent, eventTypes]);

  const resetForm = () => {
    setFormData({
      code: generateEventCode(),
      name: "",
      description: "",
      type_id: eventTypes.length > 0 ? eventTypes[0]?.id || "" : "", // Solo usar tipo si hay disponible
      event_place: "",
      event_city: "",
      event_date: new Date(),
      limit_tickets: 100,
      price_becoin: 0,
      discount: 0,
      is_refundable: true,
      refund_days_limit: 3,
      is_active: true,
    });
    setSelectedImages([]);
    setErrors({});
  };

  // Validación en línea para campos individuales
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value || value.trim().length < 3) {
          newErrors.name = "El nombre debe tener al menos 3 caracteres";
        } else {
          delete newErrors.name;
        }
        break;
      case "type_id":
        // Solo validar tipo si hay tipos disponibles
        if (eventTypes.length > 0 && !value) {
          newErrors.type_id = "Debe seleccionar un tipo de evento";
        } else {
          delete newErrors.type_id;
        }
        break;
      case "event_date":
        if (!value || new Date(value) <= new Date()) {
          newErrors.event_date = "La fecha del evento debe ser futura";
        } else {
          delete newErrors.event_date;
        }
        break;
      case "limit_tickets":
        if (!value || value < 1) {
          newErrors.limit_tickets = "Debe haber al menos 1 entrada disponible";
        } else {
          delete newErrors.limit_tickets;
        }
        break;
      case "price_becoin":
        if (value < 0) {
          newErrors.price_becoin = "El precio no puede ser negativo";
        } else {
          delete newErrors.price_becoin;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Validación completa del formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    // Solo validar tipo si hay tipos disponibles
    if (eventTypes.length > 0 && !formData.type_id) {
      newErrors.type_id = "Debe seleccionar un tipo de evento";
    }

    if (!formData.event_date || new Date(formData.event_date) <= new Date()) {
      newErrors.event_date = "La fecha del evento debe ser futura";
    }

    if (!formData.limit_tickets || formData.limit_tickets < 1) {
      newErrors.limit_tickets = "Debe haber al menos 1 entrada disponible";
    }

    if (formData.price_becoin < 0) {
      newErrors.price_becoin = "El precio no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }; // Manejar cambios en los campos
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const requestImagePickerPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showCustomAlert(
        "Permisos requeridos",
        "Necesitamos permisos para acceder a tu galería de fotos",
        "error"
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestImagePickerPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const imageUris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => [...prev, ...imageUris]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      showCustomAlert(
        "Error",
        "No se pudieron seleccionar las imágenes",
        "error"
      );
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      // Preparar datos del evento base (sin archivos)
      const baseEventData: any = {
        ...formData,
        type_id: eventTypes.length > 0 ? formData.type_id : "",
      };

      // Separar imágenes nuevas (locales) de las existentes (URLs remotas o data:)
      const isRemote = (uri: string) => {
        return /^https?:\/\//.test(uri) || uri.startsWith("data:");
      };

      const existingUrls: string[] = selectedImages.filter((u) => isRemote(u));
      const newUris: string[] = selectedImages.filter((u) => !isRemote(u));

      // Si no hay imágenes nuevas (archivos), enviar JSON normal: usar URLs existentes como strings
      if (newUris.length === 0) {
        const eventDataToSubmit: CreateEventPassDto = {
          ...baseEventData,
          // Asignar image_url e images_urls como strings si existen
          image_url: existingUrls[0] || undefined,
          images_urls:
            existingUrls.length > 1 ? existingUrls.slice(1) : undefined,
        };

        let result: EventPass;
        if (editingEvent) {
          result = await adminApiService.updateEventPass(
            editingEvent.id,
            eventDataToSubmit
          );
        } else {
          result = await adminApiService.createEventPass(eventDataToSubmit);
        }

        onSuccess(result);
        onClose();

        showCustomAlert(
          "Éxito",
          editingEvent
            ? "Evento actualizado correctamente"
            : "Evento creado correctamente",
          "success"
        );

        return;
      }

      // Si hay imágenes nuevas, procesarlas (convertir a File, comprimir) y enviar FormData con archivos + URLs existentes
      console.log(`📸 Procesando ${newUris.length} imágenes nuevas...`);
      const imageFiles: File[] = [];

      for (const imageUri of newUris) {
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const fileName = `event_image_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}.jpg`;
          const file = new File([blob], fileName, { type: "image/jpeg" });
          imageFiles.push(file);
        } catch (error) {
          console.error("Error converting image to file:", error);
        }
      }

      // Comprimir imágenes nuevas
      let compressedFiles: File[] = [];
      try {
        console.log("🔄 Comprimiendo imágenes nuevas...");
        const compressionResults = await compressImages(imageFiles, {
          maxWidth: 800,
          maxHeight: 600,
          quality: 0.7,
          maxSizeKB: 300,
        });
        compressedFiles = compressionResults.map((r) => r.compressedFile);
      } catch (compressionError) {
        console.warn(
          "⚠️ Error al comprimir imágenes, usando originales:",
          compressionError
        );
        compressedFiles = imageFiles;
      }

      // Construir FormData: agregar campos de texto y tanto URLs existentes (como strings) como archivos nuevos
      const fd = new FormData();

      Object.keys(baseEventData).forEach((key) => {
        const value = (baseEventData as any)[key];
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            fd.append(key, value.toISOString());
          } else if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            fd.append(key, value.toString());
          }
        }
      });

      // Agregar URLs existentes como strings: la primera como image_url y el resto como images_urls
      if (existingUrls.length > 0) {
        fd.append("image_url", existingUrls[0]);
        for (let i = 1; i < existingUrls.length; i++) {
          fd.append("images_urls", existingUrls[i]);
        }
      }

      // Agregar archivos nuevos: si hay, ponemos el primero como image_url (principal) y el resto en images_urls
      if (compressedFiles.length > 0) {
        // Si no hay existing principal o preferimos que la nueva primera reemplace, usamos compressedFiles[0]
        fd.append("image_url", compressedFiles[0]);
        for (let i = 1; i < compressedFiles.length; i++) {
          fd.append("images_urls", compressedFiles[i]);
        }
      }

      // Compatibilidad: si no hay archivos adicionales y no había array original, duplicar la principal
      // (mirar lógica de createEventPass si es necesario)

      // Enviar:
      // - Si estamos editando: usar PUT multipart con FormData (fd)
      // - Si estamos creando: reutilizar createEventPass pasando los Files para que la función arme su propio FormData
      let result: EventPass;
      if (editingEvent) {
        result = await adminApiService.updateEventPassFormData(
          editingEvent.id,
          fd
        );
      } else {
        // Construir payload para creación con archivos nuevos
        const eventDataForCreate: CreateEventPassDto = {
          ...baseEventData,
          image_url: compressedFiles[0],
          images_urls:
            compressedFiles.length > 1 ? compressedFiles.slice(1) : undefined,
        };

        result = await adminApiService.createEventPass(eventDataForCreate);
      }

      onSuccess(result);
      onClose();

      showCustomAlert(
        "Éxito",
        editingEvent
          ? "Evento actualizado correctamente"
          : "Evento creado correctamente",
        "success"
      );
    } catch (error: any) {
      console.error("Error saving event:", error);
      showCustomAlert(
        "Error",
        editingEvent
          ? "No se pudo actualizar el evento"
          : "No se pudo crear el evento",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = editingEvent ? "Editar Evento" : "Crear Nuevo Evento";
  const submitButtonText = editingEvent ? "Guardar Cambios" : "Crear Evento";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Sección: Información Básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Información Básica</Text>

            {/* Código del evento - Solo lectura */}
            <InputWithError
              label="Código del evento"
              value={formData.code}
              onChangeText={() => {}}
              placeholder="Generado automáticamente"
              editable={false}
              loading={loading}
            />

            {/* Nombre del evento */}
            <InputWithError
              label="Nombre del evento *"
              value={formData.name}
              onChangeText={(text) => handleFieldChange("name", text)}
              error={errors.name}
              placeholder="Ej: Concierto de Rock 2025"
              loading={loading}
            />

            {/* Descripción */}
            <InputWithError
              label="Descripción"
              value={formData.description || ""}
              onChangeText={(text) => handleFieldChange("description", text)}
              placeholder="Describe tu evento (opcional)"
              multiline={true}
              loading={loading}
            />

            {/* Tipo de evento */}
            {eventTypes.length > 0 ? (
              <SelectorWithError
                label="Tipo de evento *"
                value={formData.type_id}
                options={eventTypes}
                onSelect={(value) => handleFieldChange("type_id", value)}
                error={errors.type_id}
                loading={loading}
              />
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de evento</Text>
                <View style={[styles.selector, styles.selectorDisabled]}>
                  <Text style={styles.placeholderText}>
                    ⚠️ No disponible - Error del servidor
                  </Text>
                </View>
                <Text style={styles.helperText}>
                  Los tipos de eventos no se pudieron cargar desde el servidor.
                  El evento se creará sin tipo específico.
                </Text>
                {eventTypesError && (
                  <Text style={styles.errorText}>
                    Nota: Este campo es opcional por el momento debido a
                    problemas del servidor
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Sección: Ubicación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Ubicación</Text>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <InputWithError
                  label="Lugar"
                  value={formData.event_place || ""}
                  onChangeText={(text) =>
                    handleFieldChange("event_place", text)
                  }
                  placeholder="Ej: Estadio Nacional"
                  loading={loading}
                />
              </View>
              <View style={styles.formColumn}>
                <InputWithError
                  label="Ciudad"
                  value={formData.event_city || ""}
                  onChangeText={(text) => handleFieldChange("event_city", text)}
                  placeholder="Ej: Madrid"
                  loading={loading}
                />
              </View>
            </View>
          </View>

          {/* Sección: Fecha y Tiempo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Fecha y Tiempo</Text>

            <IntuitiveDatePicker
              label="Fecha del evento *"
              value={formData.event_date}
              onSelect={(date) => handleFieldChange("event_date", date)}
              error={errors.event_date}
              loading={loading}
            />
          </View>

          {/* Sección: Entradas y Precio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎫 Entradas y Precio</Text>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <InputWithError
                  label="Límite de entradas *"
                  value={formData.limit_tickets.toString()}
                  onChangeText={(text) =>
                    handleFieldChange("limit_tickets", parseInt(text) || 0)
                  }
                  error={errors.limit_tickets}
                  placeholder="500"
                  keyboardType="numeric"
                  loading={loading}
                />
              </View>
              <View style={styles.formColumn}>
                <InputWithError
                  label="Precio en BECOIN *"
                  value={formData.price_becoin.toString()}
                  onChangeText={(text) =>
                    handleFieldChange("price_becoin", parseFloat(text) || 0)
                  }
                  error={errors.price_becoin}
                  placeholder="0.00"
                  keyboardType="numeric"
                  loading={loading}
                />
              </View>
            </View>
          </View>

          {/* Sección: Imágenes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖼️ Imágenes del evento</Text>

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImages}
              disabled={loading}
            >
              <Text style={styles.imagePickerButtonText}>
                📷 Seleccionar Imágenes
              </Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <Text style={styles.imagePreviewTitle}>
                  Imágenes seleccionadas ({selectedImages.length}):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((imageUri, index) => (
                    <View key={index} style={styles.imagePreviewItem}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Text style={styles.removeImageButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Guardando..." : submitButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => hideAlert()}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    minHeight: 48,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imagePickerButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    marginTop: 15,
  },
  imagePreviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  imagePreviewItem: {
    marginRight: 10,
    position: "relative",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickerOption: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  pickerOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#333",
  },
  pickerOptionTextSelected: {
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 15,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 15,
    marginLeft: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Nuevos estilos para validación en línea
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: "#f8f8f8",
    color: "#999",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
  selector: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
  },
  selectorDisabled: {
    backgroundColor: "#f8f8f8",
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    marginLeft: 4,
    fontStyle: "italic",
  },
  // Estilos para el selector de fecha y hora web
  dateTimeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  webInputContainer: {
    flex: 1,
  },
  webInputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  webDateInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    minHeight: 40,
  },
  placeholderText: {
    color: "#999",
  },
  // Estilos para layout en filas
  formRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 15,
  },
  formColumn: {
    flex: 1,
  },
  // Estilos para secciones
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  // Estilos para el selector de fecha y hora
  dateTimeButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default EventFormModal;
