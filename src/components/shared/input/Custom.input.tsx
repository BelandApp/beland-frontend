// Componente Input con animaciones, recibe por props:
// label: string,
// value: string,
// onChangeText: (text: string) => void,
// --OptionalProps--
// secureTextEntry?: boolean,
// keyboardType?: "numeric" | "default"
//variant?: "underline" | "filled"

import { EyeClosed, EyeOff } from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  TextInput,
  Animated,
  Easing,
  Text,
  TextInputProps,
  Pressable,
  View,
} from "react-native";
import "@styles/inputs.css";
import { InputStyles, variantStyles } from "./InputStyles";

interface CustomInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  onBlur?: () => void;
  variant?: "filled";
  icon?: React.ReactNode;
  /** Color del texto del input (override). Si no se provee, se usa el del variant */
  textColor?: string;
  /** Color del placeholder del input (override). Si no se provea, se usa el del variant o negro */
  placeholderTextColor?: string;
  required?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  onBlur,
  placeholder,
  variant = "filled",
  icon,
  textColor,
  placeholderTextColor,
  required,
  ...props
}) => {
  const selectedVariant = variantStyles[variant];
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const inputRef = useRef<TextInput>(null);
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

  const handleFocus = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };
  return (
    <Pressable
      onPress={handleFocus}
      accessible={false}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, flex: 1 }]}
      tabIndex={-1}
    >
      <Animated.View
        accessible={false}
        tabIndex={-1}
        style={[InputStyles.baseContainer, selectedVariant.container]}
      >
        <Animated.Text
          style={[labelStyle, selectedVariant.label]}
          accessible={false}
        >
          {label}
        </Animated.Text>
        <TextInput
          autoCapitalize="none"
          ref={inputRef}
          id={"input-" + label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          style={[
            InputStyles.baseInput,
            selectedVariant.input,
            // override color if provided
            textColor ? { color: textColor } : {},
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur && onBlur();
          }}
          placeholder={!isFocused ? "" : placeholder}
          placeholderTextColor={
            placeholderTextColor ||
            (selectedVariant.input as any).color ||
            "#000"
          }
          {...props}
        />
        {secureTextEntry &&
          (isSecure ? (
            <EyeOff
              style={{ marginRight: 10 }}
              color={variant === "filled" ? "black" : "white"}
              onPress={() => setIsSecure(!isSecure)}
            />
          ) : (
            <EyeClosed
              style={{ marginRight: 10 }}
              color={variant === "filled" ? "black" : "white"}
              onPress={() => setIsSecure(!isSecure)}
            />
          ))}
        {icon && icon}
        {required && !value && (
          <Text className="text-red-500 self-start text-lg pr-1">*</Text>
        )}
        {required && value === "0" && (
          <Text className="text-red-500 self-start text-lg pr-1">*</Text>
        )}
      </Animated.View>
      <View style={InputStyles.errorContainer}>
        {error && <Text style={InputStyles.textError}>{error}</Text>}
      </View>
    </Pressable>
  );
};

export default CustomInput;
