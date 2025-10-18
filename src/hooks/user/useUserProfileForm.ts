import { useState } from "react";
import { Alert, Platform } from "react-native";
import { userService } from "src/services/user/user.service";
import { User } from "src/context";

export const useUserProfileForm = (
  user: User | null,
  setUser: (u: User) => void
) => {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [address, setAddress] = useState((user as any)?.address || "");
  const [phone, setPhone] = useState((user as any)?.phone?.toString() || "");
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    try {
      if (Platform.OS === "web") {
        const file: File | null = await new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e: any) => resolve(e?.target?.files?.[0] ?? null);
          input.click();
        });
        if (file) {
          setLocalImage(URL.createObjectURL(file));
          setLocalImageFile(file);
        }
        return;
      }

      const ImagePicker = await import("expo-image-picker");
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permisos para acceder a las fotos."
        );
        return;
      }

      const result: any = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalImage(result.assets[0].uri);
        setLocalImageFile(null);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const convertImageToDataUrl = async (): Promise<string | null> => {
    try {
      if (Platform.OS === "web" && localImageFile) {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(localImageFile);
        });
      }

      if (localImage) {
        const FileSystem = await import("expo-file-system");
        const base64 = await (FileSystem.readAsStringAsync as any)(localImage);
        const filename = localImage.split("/").pop() || "photo.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        return `data:${mimeType};base64,${base64}`;
      }
    } catch (err) {
      console.warn("[useUserProfileForm] Error converting image:", err);
    }
    return null;
  };

  const onSave = async () => {
    if (!user) return;
    if (fullName.trim().length === 0) {
      Alert.alert("Nombre inválido", "El nombre no puede quedar vacío.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { full_name: fullName, address, phone };

      if (localImage || localImageFile) {
        const dataUrl = await convertImageToDataUrl();
        if (dataUrl) payload.profile_picture_url = dataUrl;
      }

      const updated = await userService.updateUser(payload);
      setUser({
        ...user,
        ...updated,
        picture: updated.profile_picture_url || updated.picture,
      });
      setEditing(false);
      Alert.alert(
        "Perfil actualizado",
        "Tus datos se han guardado correctamente."
      );
    } catch (err) {
      Alert.alert(
        "Error",
        "No se pudo actualizar el perfil. Intenta de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setFullName(user?.full_name || "");
    setAddress((user as any)?.address || "");
    setPhone((user as any)?.phone?.toString() || "");
    setLocalImage(null);
    setEditing(false);
  };

  return {
    editing,
    setEditing,
    fullName,
    setFullName,
    address,
    setAddress,
    phone,
    setPhone,
    localImage,
    localImageFile,
    saving,
    pickImage,
    onSave,
    onCancel,
  };
};
