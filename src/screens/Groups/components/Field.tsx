import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

type FieldProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  onChangeText?: (t: string) => void;
  multiline?: boolean;
  inputProps?: TextInputProps;
  className?: string;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  inputProps,
  className = "",
}) => {
  return (
    <View className={`w-full ${className}`}>
      {label ? (
        <Text className="text-sm font-bold text-beland-text-primary mb-2">
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        className="h-13 rounded-xl border-2 border-gray-100 px-4 py-2 bg-white shadow-soft font-semibold  focus:border-[#f88e2ab7] focus:bg-[#efcbaa2c]"
        placeholderTextColor="#0003"
        {...inputProps}
      />
    </View>
  );
};

export default Field;
