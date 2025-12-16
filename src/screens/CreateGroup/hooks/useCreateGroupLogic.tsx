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
    if (!location) {
      Alert.alert("Validación", "La ubicación es requerida");
      return false;
    }
    return true;
  };

  const createGroup = async () => {
    if (!validate()) return null;
    setIsLoading(true);
    try {
      const payload: any = {
        name: groupName,
        type: groupType,
        description,
        location,
        delivery_time: deliveryTime,
      };
      if (products.length)
        payload.products = products.map((p) => ({
          name: p.name,
          estimatedPrice: p.price,
        }));
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
