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
  variant?: "underline" | "filled";
  icon?: React.ReactNode;
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
  variant = "underline",
  icon,
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
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      tabIndex={-1}
    >
      <Animated.View
        accessible={false}
        tabIndex={-1}
        style={[
          InputStyles.baseContainer,
          selectedVariant.container,
          variant === "underline" && { borderBottomColor: borderColor },
        ]}
      >
        <Animated.Text
          style={[labelStyle, selectedVariant.label]}
          accessible={false}
        >
          {label}
        </Animated.Text>
        <TextInput
          ref={inputRef}
          id={"input-" + label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          style={[InputStyles.baseInput, selectedVariant.input]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur && onBlur();
          }}
          placeholder={!isFocused ? "" : placeholder}
          {...props}
        />
        {secureTextEntry &&
          (isSecure ? (
            <EyeOff
              color={variant === "filled" ? "black" : "white"}
              onPress={() => setIsSecure(!isSecure)}
            />
          ) : (
            <EyeClosed
              color={variant === "filled" ? "black" : "white"}
              onPress={() => setIsSecure(!isSecure)}
            />
          ))}
        {icon && icon}
      </Animated.View>
      <View style={InputStyles.errorContainer}>
        {error && <Text style={InputStyles.textError}>{error}</Text>}
      </View>
    </Pressable>
  );
};

export default CustomInput;
