import React from "react";
import { Alert } from "react-native";
import { GroupService } from "@services/core";

export type Participant = {
  id: string;
  name: string;
  instagramUsername?: string;
  consumption?: number;
};

export type ProductItem = { id: string; name: string; price: number };

export const useCreateGroupLogic = (opts?: { navigation?: any }) => {
  const [groupName, setGroupName] = React.useState("");
  const [groupType, setGroupType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState<string | null>(null);
  const [locationUrl, setLocationUrl] = React.useState<string | null>(null);
  const [deliveryTime, setDeliveryTime] = React.useState("");
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = React.useState("");
  const [newParticipantInstagram, setNewParticipantInstagram] =
    React.useState("");
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [splitType, setSplitType] = React.useState<"equal" | "per_item">(
    "equal"
  );
  const [isLoading, setIsLoading] = React.useState(false);
  // Nuevos estados para privacidad, mensaje de invitación, tipo de pago y dirección
  const [privacy, setPrivacy] = React.useState<string>("");
  const [invitationMsg, setInvitationMsg] = React.useState<string>("");
  const [paymentTypeId, setPaymentTypeId] = React.useState<string>("");
  const [userAddressId, setUserAddressId] = React.useState<string>("");

  const addParticipant = (p: Participant) => setParticipants((s) => [...s, p]);
  const removeParticipant = (id: string) =>
    setParticipants((s) => s.filter((x) => x.id !== id));
  const addProduct = (p: ProductItem) => setProducts((s) => [...s, p]);
  const updateProduct = (id: string, patch: Partial<ProductItem>) =>
    setProducts((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeProduct = (id: string) =>
    setProducts((s) => s.filter((x) => x.id !== id));

  const totals = React.useMemo(() => {
    const total = products.reduce((acc, p) => acc + (p.price || 0), 0);
    const perPerson =
      participants.length + 1 > 0 ? total / (participants.length + 1) : 0;
    return { total, perPerson };
  }, [products, participants]);

  const validate = () => {
    if (!groupName || groupName.trim() === "") {
      Alert.alert("Validación", "El nombre del grupo es requerido");
      return false;
    }
    return true;
  };

  const createGroup = async (extra?: {
    privacy?: string;
    message_invitation?: string;
    payment_type_id?: string;
    user_address_id?: string;
    group_type_id?: string;
  }) => {
    if (!validate()) return null;
    setIsLoading(true);
    try {
      // Build payload matching backend CreateGroupDto
      const payload: any = {
        name: groupName,
      };
      if (description) payload.description = description;
      if (deliveryTime) {
        const parsed = new Date(deliveryTime);
        if (!isNaN(parsed.getTime())) payload.date_time = parsed.toISOString();
        else payload.date_time = deliveryTime;
      }
      // Usar group_type_id del extra si viene, si no usar el del hook
      payload.group_type_id = extra?.group_type_id ?? groupType;
      // Agregar privacy_id, message_invitation, payment_type_id y user_address_id
      payload.privacy_id = extra?.privacy ?? privacy;
      payload.message_invitation = extra?.message_invitation ?? invitationMsg;
      payload.payment_type_id = extra?.payment_type_id ?? paymentTypeId;
      payload.user_address_id = extra?.user_address_id ?? userAddressId;
      // NO enviar location_url, location, latitude, longitude ni status
      const created = await GroupService.createGroup(payload);
      return created;
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // state
    groupName,
    groupType,
    description,
    location,
    locationUrl,
    deliveryTime,
    participants,
    newParticipantName,
    newParticipantInstagram,
    products,
    splitType,
    isLoading,
    privacy,
    invitationMsg,
    paymentTypeId,
    userAddressId,
    // setters
    setGroupName,
    setGroupType,
    setDescription,
    setLocation,
    setLocationUrl,
    setDeliveryTime,
    setNewParticipantName,
    setNewParticipantInstagram,
    setSplitType,
    setPrivacy,
    setInvitationMsg,
    setPaymentTypeId,
    setUserAddressId,
    // actions
    addParticipant,
    removeParticipant,
    addProduct,
    updateProduct,
    removeProduct,
    createGroup,
    totals,
  } as const;
};

export default useCreateGroupLogic;
