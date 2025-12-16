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

  const createGroup = async () => {
    if (!validate()) return null;
    setIsLoading(true);
    try {
      // Build payload matching backend CreateGroupDto
      const payload: any = {
        name: groupName,
      };
      if (location) payload.location = location;
      if (locationUrl) payload.location_url = locationUrl;
      // map deliveryTime to date_time as ISO string if provided
      if (deliveryTime) {
        const parsed = new Date(deliveryTime);
        if (!isNaN(parsed.getTime())) payload.date_time = parsed.toISOString();
        else payload.date_time = deliveryTime;
      }
      // default status to PENDING for newly created groups
      payload.status = "PENDING";
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
