import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Platform, Alert } from "react-native";

type WebMedia = {
  file: File;
  mediaType: "image" | "video";
};

type NativeMedia = {
  uri: string;
  name: string;
  type: string;
  mediaType: "image" | "video";
};

export type UploadMedia = WebMedia | NativeMedia;

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB (videos suelen requerir más límite)

export const getPreviewUri = (media: UploadMedia | null): string | null => {
  if (!media) return null;

  if ("file" in media) {
    return URL.createObjectURL(media.file); // 🌐 WEB
  }

  return media.uri; // 📱 NATIVE
};

const getMediaName = (media: UploadMedia | null): string => {
  if (!media) return "";

  if ("file" in media) {
    return media.file.name;
  }

  return media.name;
};

export const useUploadMedia = () => {
  const [media, setMedia] = useState<UploadMedia | null>(null);
  const previewUri = media ? getPreviewUri(media) : null;
  const mediaName = media ? getMediaName(media) : "";
  const mediaType = media?.mediaType ?? null;

  const uriToFile = async (
    uri: string,
    name: string,
    type: string,
  ): Promise<File> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], name, { type });
  };

  type ImageAspect = [number, number];

  interface PickOptions {
    mediaType?: "images" | "videos" | "all";
    aspect?: ImageAspect;
    allowEditing?: boolean;
  }

  const pickMedia = async (options: PickOptions = {}) => {
    const {
      mediaType: selectedType = "all",
      aspect = [4, 6],
      allowEditing = true,
    } = options;

    try {
      // 1. Mapear la opción seleccionada al formato de Expo
      let pickerMediaType: ImagePicker.MediaTypeOptions;
      if (selectedType === "images") {
        pickerMediaType = ImagePicker.MediaTypeOptions.Images;
      } else if (selectedType === "videos") {
        pickerMediaType = ImagePicker.MediaTypeOptions.Videos;
      } else {
        pickerMediaType = ImagePicker.MediaTypeOptions.All;
      }

      // 2. Si el usuario va a permitir videos o "all", desactivamos allowsEditing
      // porque el recorte nativo falla o no está soportado en videos
      const isVideoAllowed = selectedType !== "images";
      const canEdit = allowEditing && !isVideoAllowed;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: pickerMediaType,
        allowsEditing: canEdit,
        ...(canEdit ? { aspect } : {}),
        quality: 0.8,
        videoMaxDuration: 60, // Limite opcional en segundos para videos
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const isVideo = asset.type === "video";
      const currentMediaType = isVideo ? "video" : "image";

      // 3. Validación de tamaño (Límites distintos para imagen o video)
      let fileSize = asset.fileSize;

      if (!fileSize && asset.uri) {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        fileSize = blob.size;
      }

      const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

      if (!fileSize || fileSize > maxSize) {
        const limitMb = maxSize / (1024 * 1024);
        Alert.alert(
          "Archivo no válido",
          `El ${isVideo ? "video" : "imagen"} debe ser menor a ${limitMb} MB`,
        );
        return;
      }

      const defaultName = isVideo ? "video.mp4" : "image.jpg";
      const defaultMime = isVideo ? "video/mp4" : "image/jpeg";

      // 🌐 WEB
      if (Platform.OS === "web") {
        const file = await uriToFile(
          asset.uri,
          asset.fileName ?? defaultName,
          asset.mimeType ?? defaultMime,
        );
        const selected: WebMedia = { file, mediaType: currentMediaType };
        setMedia(selected);
        return selected;
      }

      // 📱 NATIVE
      const selected: NativeMedia = {
        uri: asset.uri,
        name: asset.fileName ?? defaultName,
        type: asset.mimeType ?? defaultMime,
        mediaType: currentMediaType,
      };
      setMedia(selected);
      return selected;
    } catch {
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const appendToFormData = (formData: FormData, field = "file") => {
    if (!media) throw new Error("Archivo no seleccionado");

    if ("file" in media) {
      formData.append(field, media.file);
    } else {
      formData.append(field, media as any);
    }
  };

  const clearMedia = () => setMedia(null);

  return {
    media,
    pickMedia,
    appendToFormData,
    clearMedia,
    previewUri,
    mediaName,
    mediaType,
  };
};
