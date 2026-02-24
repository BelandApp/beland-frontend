import { View, Text } from "react-native";
import React from "react";
import { Picker, PickerProps } from "@react-native-picker/picker";
type PickerValue = string | null;

interface CustomPickerProps extends Omit<
  PickerProps,
  "selectedValue" | "onValueChange"
> {
  label: string;
  value: PickerValue;
  options: { label: string; value: PickerValue }[];
  onChange: (value: PickerValue, index: number) => void;
  required?: boolean;
}
const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  value,
  options,
  onChange,
  required,
  ...pickerProps
}) => {
  return (
    <View
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden",
      }}
    >
      <Picker
        selectedValue={value}
        mode="dropdown"
        onValueChange={onChange}
        dropdownIconColor="#000"
        style={{
          flex: 1,
          height: 40,
        }}
        {...pickerProps}
      >
        <Picker.Item key="nulleable" label={label} value={null} />
        {options.map((op, index) => (
          <Picker.Item
            key={`${op.value ?? "null"}-${index}`}
            label={op.label}
            value={op.value}
          />
        ))}
      </Picker>
      {required && !value && (
        <Text className="text-lg self-start text-red-500 p-1">*</Text>
      )}
    </View>
  );
};

export default CustomPicker;
