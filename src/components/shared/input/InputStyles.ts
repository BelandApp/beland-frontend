import { Platform, StyleSheet } from "react-native";
export const InputStyles = StyleSheet.create({
  baseContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    borderStyle: "solid",
  },
  baseInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "transparent",
  },
  errorContainer: {
    minHeight: 25,
  },
  textError: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export const variantStyles = {
  filled: {
    container: {
      flexDirection: "row",
      alignItems: "center",
      padding: 0,
      backgroundColor: "#fff",
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    input: {
      fontWeight: 200,
      paddingLeft: 8,
      color: "#363333af",
    },
    label: {
      paddingLeft: 8,
      color: "#000",
    },
  },
} as const;
