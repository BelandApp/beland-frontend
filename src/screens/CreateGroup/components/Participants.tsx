import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Participant } from "../hooks/useCreateGroupLogic";
import Card from "./Card";
import Field from "./Field";
import PrimaryButton from "./PrimaryButton";

type Props = {
  participants: Participant[];
  newName: string;
  newInsta: string;
  onChangeName: (t: string) => void;
  onChangeInsta: (t: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
};

export const NewParticipants: React.FC<Props> = ({
  participants,
  newName,
  newInsta,
  onChangeName,
  onChangeInsta,
  onAdd,
  onRemove,
}) => {
  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-extrabold text-beland-text-primary">
          Participantes
        </Text>
        <View className="px-3 py-1 rounded-full bg-beland-orange-500">
          <Text className="text-beland-text-inverse font-bold text-xs">
            {participants.length + 1} Miembros
          </Text>
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <View className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-beland-green-400">
            <Text className="font-bold text-white">Y</Text>
          </View>
          <Field
            label={undefined}
            value={`Tú (Organizador)`}
            inputProps={{ editable: false }}
          />
        </View>
        {participants.map((p) => (
          <View key={p.id} className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-gray-100">
              <Text className="text-gray-500">👤</Text>
            </View>
            <Field
              label={undefined}
              value={p.name}
              inputProps={{ editable: false }}
            />
            <TouchableOpacity
              onPress={() => onRemove(p.id)}
              className="ml-2 px-2 py-1"
            >
              <Text className="text-red-600">×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View className="mt-2">
        <Text className="text-sm font-bold mb-2 text-beland-text-primary">
          Agregar participante
        </Text>
        <Field
          placeholder="Nombre completo *"
          value={newName}
          onChangeText={onChangeName}
        />
        <Field
          placeholder="@usuario_instagram"
          value={newInsta}
          onChangeText={onChangeInsta}
        />
        <PrimaryButton onPress={onAdd} className="mt-2">
          Agregar Participante
        </PrimaryButton>
      </View>
    </Card>
  );
};

export default NewParticipants;
