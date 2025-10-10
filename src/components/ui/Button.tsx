import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary" | "link" | "none";
}

export const Button = ({
  title,
  onPress,
  style,
  textStyle,
  variant = "primary",
}: ButtonProps) => (
  <TouchableOpacity
    style={[styles.button, styles[variant], style]}
    onPress={onPress}
    accessibilityLabel="button"
    accessibilityRole="button"
  >
    <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#F88D2A",
  },
  secondary: {
    backgroundColor: "#6B7280",
  },
  link: {
    backgroundColor: "transparent",
  },
  none: {
    padding: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  linkText: {
    color: "#F88D2A",
  },
  noneText: {
    color: "inherit",
  }
});
