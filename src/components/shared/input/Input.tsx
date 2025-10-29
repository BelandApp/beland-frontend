import React, { useState, useRef, useEffect } from "react";
import {
  TextInput,
  Animated,
  Easing,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: string;
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
}) => {
  const [isFocused, setIsFocused] = useState(false);

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
    left: 5,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
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

  const borderWidth = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 3],
  });

  return (
    <TouchableOpacity onPress={() => setIsFocused(true)}>
      <Animated.View
        style={[
          styles.container,
          {
            borderBottomColor: borderColor,
            borderBottomWidth: borderWidth,
          },
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          id={'input-' + label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType as any}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 30,
    position: "relative",
    outlineWidth: 0,
    borderWidth: 0,
  },
  input: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 5,
    fontSize: 17,
    fontWeight: "600",
    color: "white",
    borderStyle: "solid",
    borderColor: "transparent",
    outlineColor: "transparent",
  },
});

export default CustomInput;
