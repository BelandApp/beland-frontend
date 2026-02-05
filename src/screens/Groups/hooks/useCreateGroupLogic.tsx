import React from "react";
import { Alert } from "react-native";
import {
  GroupService,
  GroupType,
  GroupPrivacy,
  PaymentType,
} from "@/services/GroupApiService";
import { UserAddress } from "@/services/addressService";
import { notify } from "src/hooks/notification/notify.external";

export type Participant = {
  id: string;
  name: string;
  instagramUsername?: string;
  consumption?: number;
};

export type ProductItem = { id: string; name: string; price: number };

export const useCreateGroupLogic = (opts?: { navigation?: any }) => {
  // Form State
  const [groupName, setGroupName] = React.useState("");
  const [groupType, setGroupType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [privacy, setPrivacy] = React.useState<string>("");
  const [invitationMsg, setInvitationMsg] = React.useState<string>("");
  const [paymentTypeId, setPaymentTypeId] = React.useState<string>("");
  const [userAddressId, setUserAddressId] = React.useState<string>("");
  const [eventDate, setEventDate] = React.useState<string>("");

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
  React.useEffect(() => {
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
  const isValid = groupName && groupType && paymentTypeId && eventDate;
  const createGroup = async () => {
    if (!validate()) return null;
    setIsCreating(true);
    try {
      const payload: any = {
        name: groupName,
        group_type_id: groupType,
        privacy_id: privacy,
        payment_type_id: paymentTypeId,
        user_address_id: userAddressId,
        event_at: eventDate,
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
    isValid,

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
  } as const;
};

export default useCreateGroupLogic;
