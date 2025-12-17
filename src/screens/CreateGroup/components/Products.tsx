import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ProductItem } from "../hooks/useCreateGroupLogic";
import Card from "./Card";

type Props = {
  products: ProductItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ProductItem>) => void;
  onRemove: (id: string) => void;
};

export const NewProducts: React.FC<Props> = ({
  products,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <Card>
      <Text className="text-lg font-extrabold mb-3 text-beland-text-primary">
        Productos Iniciales
      </Text>
      {products.map((p) => (
        <View key={p.id} className="mb-3">
          <View className="flex-row items-center mb-3">
            <TextInput
              value={p.name}
              onChangeText={(t) => onUpdate(p.id, { name: t })}
              placeholder="Nombre del producto"
              className="flex-1 h-13 rounded-xl border border-beland-border px-3 mr-2"
            />
            <TextInput
              value={String(p.price)}
              onChangeText={(t) => onUpdate(p.id, { price: Number(t) || 0 })}
              placeholder="0.00"
              keyboardType="numeric"
              className="w-24 h-13 rounded-xl border border-beland-border px-3"
            />
            <TouchableOpacity
              onPress={() => onRemove(p.id)}
              className="ml-2 px-2 py-1"
            >
              <Text className="text-red-600">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity
        onPress={onAdd}
        className="mt-3 p-3 rounded-xl border-2 border-dashed border-beland-border items-center"
      >
        <Text className="text-gray-500">Añadir otro producto</Text>
      </TouchableOpacity>
    </Card>
  );
};
export default NewProducts;
