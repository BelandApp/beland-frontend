import { View, Text, StyleSheet } from "react-native";
import WrapperModal from "./wrapperModal";
import { Button } from "../buttons";
import { TextInput } from "react-native-gesture-handler";
import { colors } from "src/styles";
import { useCallback, useState } from "react";
import { notify } from "src/hooks/notification/notify.external";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type RecollectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => Promise<void>;
};
const RecolectModal: React.FC<RecollectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [recycleWeight, setRecycleWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resetState = () => {
    setRecycleWeight("");
    setError(null);
  };
  const validate = (): { weight: number } | null => {
    if (!recycleWeight.trim()) {
      setError("Ingrese el peso a reciclar");
      return null;
    }

    const parsedWeight = Number(recycleWeight);
    if (Number.isNaN(parsedWeight)) {
      setError("El peso del residuo debe ser un número");
      return null;
    }

    return { weight: parsedWeight };
  };

  const handleConfirm = useCallback(async () => {
    const result = validate();
    if (!result) return;

    setLoading(true);
    setError(null);

    try {
      await onConfirm(result.weight);
      resetState();
      onClose();
    } catch (err) {
      notify.error({ message: "Error al cargar el reciclado" });
    } finally {
      setLoading(false);
    }
  }, [recycleWeight]);

  const handleClose = () => {
    if (loading) {
      notify.info({ message: "Aguarda a que procesemos la acción" });
      return;
    }
    resetState();
    onClose();
  };
  return (
    <WrapperModal
      header={
        <View className="flex-row gap-2 items-baseline">
          <MaterialCommunityIcons
            name="recycle"
            size={32}
            color={colors.belandOrange}
          />
          <Text className="text-lg font-semibold">Recolectar orden</Text>
        </View>
      }
      isOpen={isOpen}
      onClose={handleClose}
      content={
        <View className="p-6">
          <Text className="text-lg">Peso de la recolección:</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            className={`${loading}`}
            value={recycleWeight}
            onChangeText={(text) => {
              if (loading) {
                return;
              }
              setRecycleWeight(text);
              setError(null);
            }}
            placeholder="Ej: 2 (kg)"
            keyboardType="numeric"
            editable={!loading}
          />
          {error && (
            <View className="flex-row gap-2">
              <MaterialCommunityIcons
                name="alert-circle"
                size={16}
                color="#dc3545"
              />
              <Text className="text-red-500">{error}</Text>
            </View>
          )}
          <View className="flex-row gap-1 mt-2">
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text className="text-xs text-stone-400">
              Deberás pesar el residuo que te entregan
            </Text>
          </View>
        </View>
      }
      actions={
        <View className="flex-row items-center gap-2 m-auto">
          <Button
            disabled={loading}
            onPress={handleClose}
            title="Cancelar"
            variant="secondary"
          />
          <Button
            disabled={loading}
            onPress={handleConfirm}
            title={loading ? "Procesando" : "Recolectar"}
          />
        </View>
      }
    />
  );
};

export default RecolectModal;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderColor: "#ced4da",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 4,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: "#dc3545",
  },
});
