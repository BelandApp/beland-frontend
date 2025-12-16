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
        className="h-13 rounded-xl border border-beland-border px-3 bg-white"
        {...inputProps}
      />
    </View>
  );
};

export default Field;
