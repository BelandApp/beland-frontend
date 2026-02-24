import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { InputStyles, variantStyles } from "./InputStyles";

interface DatePickerInputProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;

  error?: string;
  variant?: "filled";
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  error,
  variant = "filled",
  required,
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const selectedVariant = variantStyles[variant];

  const [isFocused, setIsFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;
  const animatedBorder = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  useEffect(() => {
    Animated.timing(animatedBorder, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const labelStyle = {
    position: "absolute" as const,
    left: 0,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [10, -10],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 13],
    }),
  };

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#FFD700"],
  });

  const formatDateNative = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("es-AR").format(date);
  };

  const formatDateWeb = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const handleOpen = () => {
    if (disabled) return;
    setIsFocused(true);

    if (Platform.OS !== "web") {
      setShowPicker(true);
    }
  };

  const handleNativeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false);
      setIsFocused(false);
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleWebChange = (e: any) => {
    const selected = new Date(e.target.value);
    onChange(selected);
  };

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, flex: 1 }]}
      >
        <Animated.View
          style={[
            InputStyles.baseContainer,
            selectedVariant.container,
            { borderColor, opacity: disabled ? 0.6 : 1 },
          ]}
        >
          <Animated.Text style={[labelStyle, selectedVariant.label]}>
            {label}
          </Animated.Text>

          {Platform.OS === "web" ? (
            <input
              type="date"
              value={formatDateWeb(value)}
              onChange={handleWebChange}
              min={minimumDate ? formatDateWeb(minimumDate) : undefined}
              max={maximumDate ? formatDateWeb(maximumDate) : undefined}
              disabled={disabled}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                padding: "10px 8px",
                fontWeight: 500,
                color: "#363333af",
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          ) : (
            <View
              style={[
                InputStyles.baseInput,
                selectedVariant.input,
                { justifyContent: "center" },
              ]}
            >
              <Text
                style={{
                  color: value ? "#363333af" : "#999",
                }}
              >
                {value ? formatDateNative(value) : ""}
              </Text>
            </View>
          )}

          {required && !value && (
            <Text className="text-red-500 self-start text-lg pr-1">*</Text>
          )}
        </Animated.View>

        <View style={InputStyles.errorContainer}>
          {error && <Text style={InputStyles.textError}>{error}</Text>}
        </View>
      </Pressable>

      {Platform.OS !== "web" && showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleNativeChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </>
  );
};

export default DatePickerInput;
