import { EyeClosed, EyeOff } from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  TextInput,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInputProps,
  Pressable,
  Platform,
} from "react-native";
import "@styles/inputs.css";

interface CustomInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  onBlur?: () => void;
}

// Componente Input con animaciones, recibe por props:
// label: string,
// value: string,
// onChangeText: (text: string) => void,
// --OptionalProps--
// secureTextEntry?: boolean,
// keyboardType?:

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  onBlur,
  ...props
}) => {
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
    color: "#ffffffaa",
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
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.8 : 1, },
      ]}
      accessible={false}
      tabIndex={-1}
    >
      <Animated.View
        accessible={false}
        tabIndex={-1}
        style={[
          styles.container,
          {
            borderBottomColor: borderColor,
          },
        ]}
      >
        <Animated.Text style={labelStyle} accessible={false}>
          {label}
        </Animated.Text>
        <TextInput
          ref={inputRef}
          id={"input-" + label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur && onBlur();
          }}
          {...props}
        />
        {secureTextEntry &&
          (isSecure ? (
            <EyeOff color="white" onPress={() => setIsSecure(!isSecure)} />
          ) : (
            <EyeClosed color="white" onPress={() => setIsSecure(!isSecure)} />
          ))}
      </Animated.View>
      {error && <Text style={styles.textError}>{error}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginBottom: 20,
    flexDirection: "column",
    gap: 5,
  },
  container: {
    position: "relative",
    outlineWidth: 0,
    borderWidth: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: Platform.OS === "web" ? "center" : "flex-end",
    borderBottomWidth: 2,
    paddingBottom: Platform.OS === "web" ? 0 : 4,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === "web" ? 8 : 10,
    fontSize: 17, 
    fontWeight: "600",
    color: "white",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "transparent",
    outlineColor: "transparent",
  },
  textError: { color: "red", fontSize: 12, maxWidth: 300 },
});

export default CustomInput;
