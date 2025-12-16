import React from "react";
import { TouchableOpacity, Text } from "react-native";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  loading?: boolean;
  className?: string;
};

const PrimaryButton: React.FC<Props> = ({
  children,
  onPress,
  loading,
  className = "",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`w-full rounded-full h-12 items-center justify-center bg-beland-orange-500 ${className}`}
    >
      <Text className="font-bold text-beland-text-inverse">
        {loading ? "Cargando..." : children}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
