import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  GroupService,
  GroupType,
  GroupPrivacy,
  PaymentType,
} from "@/services/GroupApiService";
import { UserAddress } from "@/services/addressService";
import { CloudinaryService } from "src/services/cloudinary/cloudinary.service";
import { notify } from "src/hooks/notification/notify.external";
import * as ImagePicker from "expo-image-picker";
export type Participant = {
  id: string;
  name: string;
  instagramUsername?: string;
  consumption?: number;
};

export type ProductItem = { id: string; name: string; price: number };

export const useCreateGroupLogic = (opts?: { navigation?: any }) => {
  // Form State
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<string>("");
  const [invitationMsg, setInvitationMsg] = useState<string>("");
  const [paymentTypeId, setPaymentTypeId] = useState<string>("");
  const [userAddressId, setUserAddressId] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [imageFile, setImageFile] = useState<any | null>(null);
  // Data Options State
  const [groupTypes, setGroupTypes] = React.useState<GroupType[]>([]);
  const [privacyOptions, setPrivacyOptions] = React.useState<GroupPrivacy[]>(
    [],
  );
  const [paymentTypes, setPaymentTypes] = React.useState<PaymentType[]>([]);
  const [userAddresses, setUserAddresses] = React.useState<UserAddress[]>([]);

  // Loading State
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);

  // Load all required data on mount
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const data = await GroupService.getInfoCreate();
        if (mounted && data) {
          setGroupTypes(data.group_types || []);
          setPrivacyOptions(data.group_privacies || []);
          setPaymentTypes(data.payment_types || []);
          setUserAddresses(data.user_address || []);

          // Set defaults if available
          if (data.group_types?.length > 0)
            setGroupType(data.group_types[0].id);
          if (data.group_privacies?.length > 0)
            setPrivacy(data.group_privacies[0].id);
          if (data.payment_types?.length > 0) {
            // Prefer FULL payment if exists, else first one
            const full = data.payment_types.find((p) => p.code === "FULL");
            setPaymentTypeId(full ? full.id : data.payment_types[0].id);
          }
          const defaultAddr = data.user_address?.find((a: any) => a.isDefault);
          if (defaultAddr) setUserAddressId(defaultAddr.id);
          else if (data.user_address?.length > 0)
            setUserAddressId(data.user_address[0].id);
        }
      } catch (error) {
        console.error("Error loading create group info:", error);
        Alert.alert(
          "Error",
          "No se pudo cargar la información necesaria para crear grupos.",
        );
      } finally {
        if (mounted) setIsLoadingData(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    if (!groupName || groupName.trim() === "") {
      notify.error({ message: "El nombre del grupo es requerido" });
      return false;
    }
    if (!groupType) {
      notify.error({ message: "Debes seleccionar un tipo de grupo" });
      return false;
    }
    if (!paymentTypeId) {
      notify.error({ message: "Debes seleccionar un método de pago" });
      return false;
    }
    if (!eventDate) {
      notify.error({ message: "Debes seleccionar una fecha para el evento" });
      return false;
    }
    return true;
  };
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoadingData(true);
        setImageFile(result.assets[0]);
      }
    } catch (error) {
      console.error(error);
      notify.error({ message: "Error al subir la imagen" });
    } finally {
      setIsLoadingData(false);
    }
  };
  const createGroup = async () => {
    if (!validate()) return null;
    console.log("pase");
    setIsCreating(true);
    try {
      // ===============================
      // 🖼️ CREAMOS CLOUDINARY URL
      // ===============================
      // const imageUrl = imageFile
      //   ? await GroupService.uploadImage(imageFile)
      //   : "";

      // if (!imageUrl)
      //   notify.error({
      //     message: "No pudimos guardar tu imagen",
      //     message2: "No te preocupes puedes editar dentro del grupo",
      //   });
      // ===============================
      // CREAMOS GRUPO
      // ===============================
      const payload: any = {
        name: groupName,
        group_type_id: groupType,
        privacy_id: privacy,
        payment_type_id: paymentTypeId,
        user_address_id: userAddressId,
        event_at: eventDate,
        // image: imageUrl ? imageUrl : "",
      };

      const desc = description?.trim();
      if (desc && desc.length >= 3) payload.description = desc;

      const invMsg = invitationMsg?.trim();
      if (invMsg && invMsg.length >= 3) payload.message_invitation = invMsg;

      const created = await GroupService.createGroup(payload);
      return created;
    } catch (e: any) {
      throw e;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    // Form Values
    groupName,
    groupType,
    description,
    privacy,
    invitationMsg,
    paymentTypeId,
    userAddressId,
    eventDate,
    imageFile,

    // Setters
    setGroupName,
    setGroupType,
    setDescription,
    setPrivacy,
    setInvitationMsg,
    setPaymentTypeId,
    setUserAddressId,
    setEventDate,

    // Data Options
    groupTypes,
    privacyOptions,
    paymentTypes,
    userAddresses,
    setUserAddresses, // Exposed for modal update

    // Status
    isLoading: isCreating,
    isLoadingData,

    // Actions
    createGroup,
    handlePickImage,
  } as const;
};

export default useCreateGroupLogic;
