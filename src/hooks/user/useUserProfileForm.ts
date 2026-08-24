import { useState } from "react";
import { Alert, Platform } from "react-native";
import { userService } from "src/services/user/user.service";
import { useAuth, User } from "src/context";
import { notify } from "../notification/notify.external";
import { CloudinaryService, getBackendErrorMessage } from "src/services";
import { getPreviewUri, useUploadMedia } from "../media/useUploadMedia";

export const useUserProfileForm = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [address, setAddress] = useState((user as any)?.address || "");
  const [phone, setPhone] = useState((user as any)?.phone?.toString() || "");
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { pickMedia } = useUploadMedia();
  const [loading, setLoading] = useState(false);
  const handleNewImage = async () => {
    try {
      const selectedImage = await pickMedia({ mediaType: "images" });
      if (!selectedImage) return;
      setLoading(true);
      const formData = new FormData();
      if ("file" in selectedImage) {
        formData.append("file", selectedImage.file);
      } else {
        formData.append("file", selectedImage as any);
      }
      const imageUrl = await CloudinaryService.uploadImage(formData);
      await userService.updateUser({
        profile_picture_url: imageUrl,
      });
      notify.success({
        message: "Imagen actualizada",
      });
      const preview = getPreviewUri(selectedImage);
      setLocalImage(preview);
      if (preview !== null) {
        updateUser({ profile_picture_url: preview });
      }
    } catch (err) {
      const message = getBackendErrorMessage(err);
      notify.error({ message });
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      setLoading(true);
      let payload: {
        full_name?: string;
        address?: string;
        phone?: string;
      } = {};
      if (fullName) payload.full_name = fullName;
      if (address) payload.address = address;
      if (phone) payload.phone = phone;

      const updated = await userService.updateUser(payload);
      updateUser(updated);
      setEditing(false);
      notify.success({
        message: "Perfil actualizado",
      });
    } catch (err) {
      const message = getBackendErrorMessage(err);
      notify.error({ message });
    } finally {
      setLoading(false);
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
    loading,
    setEditing,
    fullName,
    setFullName,
    address,
    setAddress,
    phone,
    setPhone,
    localImage,
    saving,
    handleNewImage,
    onSave,
    onCancel,
  };
};
