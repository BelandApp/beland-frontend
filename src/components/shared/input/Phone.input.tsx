import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "src/styles";

interface PhoneInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  onBlur?: () => void;
}

const COUNTRY_CODES = [
  { code: "+593", name: "ECU" },
  { code: "+54", name: "ARG" },
  { code: "+34", name: "ESP" },
  { code: "+52", name: "MEX" },
  { code: "+57", name: "COL" },
  { code: "+1", name: "USA" },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  onBlur,
  ...props
}) => {
  const [countryCode, setCountryCode] = useState("+54");
  const [number, setNumber] = useState(value.replace(/^\+\d+/, ""));
  const [isFocused, setIsFocused] = useState(false);

  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;
  const animatedBorder = useRef(new Animated.Value(0)).current;

  // Animaciones del label y borde (idénticas al CustomInput)
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
    left: 90,
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

  const handleChange = (text: string) => {
    setNumber(text);
    onChange(`${countryCode}${text}`);
  };

  return (
    <Pressable
      tabIndex={-1}
      accessible={false}
      onPress={() => setIsFocused(true)}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
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
        <Animated.Text style={labelStyle}>Teléfono</Animated.Text>

        <View style={styles.row} accessible={false} tabIndex={-1}>
          <Picker
            mode="dialog"
            // selectionColor={"white"}
            selectedValue={countryCode}
            onValueChange={(code) => {
              setCountryCode(code);
              onChange(`${code}${number}`);
            }}
            style={styles.picker}
            dropdownIconColor="white"
          >
            {COUNTRY_CODES.map((c) => (
              <Picker.Item
                key={c.code}
                label={`${c.name} ${c.code}`}
                value={c.code}
                color="black"
                style={{ backgroundColor: colors.belandOrange }}
              />
            ))}
          </Picker>

          <TextInput
            keyboardType="phone-pad"
            value={number}
            onChangeText={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur && onBlur();
            }}
            style={styles.input}
            {...props}
          />
        </View>
      </Animated.View>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
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
    flexDirection: "column",
    justifyContent: "center",
    borderBottomWidth: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  picker: {
    width: 85,
    height: 38,
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "white",
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
});

export default PhoneInput;
