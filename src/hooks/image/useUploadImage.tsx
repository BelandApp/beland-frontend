type WebImage = {
  file: File;
};

type NativeImage = {
  uri: string;
  name: string;
  type: string;
};

export type UploadImage = WebImage | NativeImage;

import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Platform, Alert } from "react-native";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const getPreviewUri = (image: UploadImage | null): string | null => {
  if (!image) return null;

  if ("file" in image) {
    return URL.createObjectURL(image.file); // 🌐 WEB
  }

  return image.uri; // 📱 NATIVE
};

const getImageName = (image: UploadImage | null): string => {
  if (!image) return "";

  if ("file" in image) {
    return image.file.name;
  }

  return image.name;
};
export const useUploadImage = () => {
  const [image, setImage] = useState<UploadImage | null>(null);
  const previewUri = image ? getPreviewUri(image) : null;
  const imageName = image ? getImageName(image) : "";
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
  const pickImage = async (imageAspect: ImageAspect = [4, 6]) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: imageAspect,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      // 🔎 Validación tamaño (web + native)
      let fileSize = asset.fileSize;

      if (!fileSize && asset.uri) {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        fileSize = blob.size;
      }

      if (!fileSize || fileSize > MAX_SIZE_BYTES) {
        Alert.alert("Imagen inválida", "La imagen debe ser menor a 10 MB");
        return;
      }

      // 🌐 WEB
      if (Platform.OS === "web") {
        const file = await uriToFile(
          asset.uri,
          asset.fileName ?? "image.jpg",
          asset.mimeType ?? "image/jpeg",
        );
        const selected = { file };
        setImage({ file });
        return selected;
      }
      // 📱 NATIVE
      const selected = {
        uri: asset.uri,
        name: asset.fileName ?? "image.jpg",
        type: asset.mimeType ?? "image/jpeg",
      };
      setImage(selected);
      return selected;
    } catch {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const appendToFormData = (formData: FormData, field = "file") => {
    if (!image) throw new Error("Imagen no seleccionada");

    if ("file" in image) {
      formData.append(field, image.file);
    } else {
      formData.append(field, image as any);
    }
  };

  const clearImage = () => setImage(null);

  return {
    image,
    pickImage,
    appendToFormData,
    clearImage,
    previewUri,
    imageName,
  };
};
