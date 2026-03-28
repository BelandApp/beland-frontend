import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { compressImages } from "src/utils/imageCompression";
import {
  CreateEventPassDto,
  adminApiService,
} from "src/services/AdminApiService";
import { getBackendErrorMessage } from "src/services";

export type PartialEventForm = Partial<CreateEventPassDto> & {
  images?: string[]; // uris for preview
};

export function useEventForm(initial?: PartialEventForm) {
  const [form, setForm] = useState<PartialEventForm>(initial || {});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(
    <K extends keyof PartialEventForm>(key: K, value: PartialEventForm[K]) => {
      setForm((s) => ({ ...s, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => setForm(initial || {}), [initial]);

  const addImage = useCallback((uri: string) => {
    setForm((s) => ({ ...s, images: [...(s.images || []), uri] }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setForm((s) => ({
      ...s,
      images: (s.images || []).filter((_, i) => i !== index),
    }));
  }, []);

  const requestImagePickerPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  }, []);

  const pickImages = useCallback(
    async (notify?: any) => {
      const hasPermission = await requestImagePickerPermissions();
      if (!hasPermission) {
        if (notify?.error)
          notify.error({
            message: "Necesitamos permisos para acceder a tu galería de fotos",
          });
        return;
      }

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 0.8,
          aspect: [16, 9],
          allowsEditing: false,
        });

        if (!result.canceled && result.assets) {
          const imageUris = result.assets.map((asset) => asset.uri);
          setForm((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...imageUris],
          }));
        }
      } catch (error) {
        console.error("Error picking images:", error);
        if (notify?.error)
          notify.error({ message: "No se pudieron seleccionar las imágenes" });
      }
    },
    [requestImagePickerPermissions]
  );

  const validateField = useCallback(
    (field: string, value: any) => {
      const newErrors = { ...errors };
      switch (field) {
        case "name":
          if (!value || value.trim().length < 3)
            newErrors.name = "El nombre debe tener al menos 3 caracteres";
          else delete newErrors.name;
          break;
        case "type_id":
          // validation requiring availability is left to caller
          if (!value) newErrors.type_id = "Debe seleccionar un tipo de evento";
          else delete newErrors.type_id;
          break;
        case "event_date":
          {
            const date = value ? new Date(value) : null;
            const invalid = !date || isNaN(date.getTime());
            if (invalid) {
              newErrors.event_date = "Formato de fecha inválido";
            } else {
              const now = new Date();
              const dateYMD = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
              );
              const nowYMD = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              const isFuture =
                dateYMD.getTime() > nowYMD.getTime() ||
                date.getTime() > now.getTime();
              if (!isFuture)
                newErrors.event_date = "La fecha del evento debe ser futura";
              else delete newErrors.event_date;
            }
          }
          break;
        case "limit_tickets":
          if (!value || value < 1)
            newErrors.limit_tickets =
              "Debe haber al menos 1 entrada disponible";
          else delete newErrors.limit_tickets;
          break;
        case "price_dollar":
          if (value < 0)
            newErrors.price_dollar = "El precio no puede ser negativo";
          else delete newErrors.price_dollar;
          break;
      }
      setErrors(newErrors);
      return newErrors;
    },
    [errors]
  );

  const validateForm = useCallback(
    (eventTypes: any[] = []) => {
      const newErrors: Record<string, string> = {};
      if (!form.name || form.name.trim().length < 3)
        newErrors.name = "El nombre debe tener al menos 3 caracteres";
      if (eventTypes.length > 0 && !form.type_id)
        newErrors.type_id = "Debe seleccionar un tipo de evento";
      // Validate event_date allowing same-day with later time
      if (!form.event_date) {
        newErrors.event_date = "La fecha del evento debe ser futura";
      } else {
        const date = new Date(form.event_date as any);
        if (isNaN(date.getTime())) {
          newErrors.event_date = "Formato de fecha inválido";
        } else {
          const now = new Date();
          const dateYMD = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          const nowYMD = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const isFuture =
            dateYMD.getTime() > nowYMD.getTime() ||
            date.getTime() > now.getTime();
          if (!isFuture)
            newErrors.event_date = "La fecha del evento debe ser futura";
        }
      }
      if (!form.limit_tickets || form.limit_tickets < 1)
        newErrors.limit_tickets = "Debe haber al menos 1 entrada disponible";
      if (form.price_dollar !== undefined && form.price_dollar < 0)
        newErrors.price_dollar = "El precio no puede ser negativo";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [form]
  );

  const submit = useCallback(
    async (params: {
      editingEvent?: any | null;
      notify?: any;
      onSuccess?: (ev: any) => void;
      onClose?: () => void;
      eventTypes?: any[];
    }) => {
      const { editingEvent, notify, onSuccess, onClose, eventTypes } =
        params || {};
      if (!validateForm(eventTypes || [])) return;
      setLoading(true);
      try {
        const baseEventData: any = {
          ...form,
          type_id: eventTypes && eventTypes.length > 0 ? form.type_id : "",
        };

        const isRemote = (uri: string) =>
          /^https?:\/\//.test(uri) || uri.startsWith("data:");
        const imgs = form.images || [];
        const existingUrls: string[] = imgs.filter((u) => isRemote(u));
        const newUris: string[] = imgs.filter((u) => !isRemote(u));

        if (newUris.length === 0) {
          // no newUris: submit JSON payload
          // Omit `images` preview key from payload: backend schema forbids `images` property
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { images: _imgs, ...cleanBase } = baseEventData;
          const eventDataToSubmit: CreateEventPassDto = {
            ...cleanBase,
            image_url: existingUrls[0] || undefined,
            images_urls:
              existingUrls.length > 1 ? existingUrls.slice(1) : undefined,
          };
          let result: any;
          if (editingEvent) {
            result = await adminApiService.updateEventPass(
              editingEvent.id,
              eventDataToSubmit
            );
          } else {
            result = await adminApiService.createEventPass(eventDataToSubmit);
          }
          // create/update result handled below
          if (onSuccess) onSuccess(result);
          if (onClose) onClose();
          if (notify?.success)
            notify.success({
              message: editingEvent
                ? "Evento actualizado correctamente"
                : "Evento creado correctamente",
            });
          return result;
        }

        // Convert newUris -> File
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
            const message = getBackendErrorMessage(error);
            if (notify?.error) notify.error({ message });
            console.error("Error converting image to file:", error);
          }
        }

        let compressedFiles: File[] = [];
        try {
          const compressionResults = await compressImages(imageFiles, {
            maxWidth: 800,
            maxHeight: 600,
            quality: 0.7,
            maxSizeKB: 300,
          });
          compressedFiles = compressionResults.map((r) => r.compressedFile);
        } catch (compressionError) {
          console.warn(
            "Error compressing images, using originals:",
            compressionError
          );
          compressedFiles = imageFiles;
        }

        const fd = new FormData();
        Object.keys(baseEventData).forEach((key) => {
          const value = (baseEventData as any)[key];
          if (value !== undefined && value !== null) {
            if (value instanceof Date) fd.append(key, value.toISOString());
            else if (
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            )
              fd.append(key, value.toString());
          }
        });

        if (existingUrls.length > 0) {
          fd.append("image_url", existingUrls[0]);
          for (let i = 1; i < existingUrls.length; i++)
            fd.append("images_urls", existingUrls[i]);
        }

        if (compressedFiles.length > 0) {
          fd.append("image_url", compressedFiles[0]);
          for (let i = 1; i < compressedFiles.length; i++)
            fd.append("images_urls", compressedFiles[i]);
        }

        let result: any;
        if (editingEvent) {
          result = await adminApiService.updateEventPassFormData(
            editingEvent.id,
            fd
          );
        } else {
          // Omit preview `images` from create payload as well
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { images: _imgs, ...cleanBaseCreate } = baseEventData;
          const eventDataForCreate: CreateEventPassDto = {
            ...cleanBaseCreate,
            image_url: compressedFiles[0],
            images_urls:
              compressedFiles.length > 1 ? compressedFiles.slice(1) : undefined,
          };
          result = await adminApiService.createEventPass(eventDataForCreate);
        }

        if (onSuccess) onSuccess(result);
        if (onClose) onClose();
        if (notify?.success)
          notify.success({
            message: editingEvent
              ? "Evento actualizado correctamente"
              : "Evento creado correctamente",
          });
        return result;
      } catch (error: any) {
        console.error("Error saving event:", error);
        const message = getBackendErrorMessage(error);
        if ((params as any).notify?.error)
          (params as any).notify.error({ message });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [form, validateForm]
  );

  return {
    form,
    setField,
    reset,
    addImage,
    removeImage,
    pickImages,
    validateField,
    validateForm,
    submit,
    // Convenience setters for event dates exposed to UI components
    setEventDate: (d: Date) => setField("event_date" as any, d as any),
    // Use backend key `end_sale_date` so payload aligns with CreateEventPassDto
    setEventEndDate: (d: Date) => setField("end_sale_date" as any, d as any),
    loading,
    errors,
  } as const;
}
