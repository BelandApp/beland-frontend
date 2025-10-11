import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { theme } from "@design-system/tokens";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[`${size}Button`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "white" : theme.colors.primary[500]}
        />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.semanticSpacing.radius.lg,
    ...theme.semanticShadows.button,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary[500],
  },
  secondary: {
    backgroundColor: theme.colors.neutral[0],
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  danger: {
    backgroundColor: theme.colors.semantic.error[500],
  },
  ghost: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },

  // Sizes
  smallButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    minHeight: 44,
  },
  largeButton: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    minHeight: 52,
  },

  // Text styles
  text: {
    fontSize: theme.textStyles.button.fontSize,
    lineHeight: theme.textStyles.button.lineHeight,
    fontWeight: theme.textStyles.button.fontWeight as TextStyle["fontWeight"],
    letterSpacing: theme.textStyles.button.letterSpacing,
    textAlign: "center",
  },
  primaryText: {
    color: theme.colors.neutral[0],
  },
  secondaryText: {
    color: theme.colors.primary[500],
  },
  dangerText: {
    color: theme.colors.neutral[0],
  },
  ghostText: {
    color: theme.colors.primary[500],
  },

  // Text sizes
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.base,
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },

  // States
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },

  // Icon
  icon: {
    fontSize: theme.typography.fontSize.base,
    marginRight: theme.spacing[2],
  },
});
