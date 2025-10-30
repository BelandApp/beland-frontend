import React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
type LoaderProps = {
  title?: string;
};
export const CustomLoader: React.FC<LoaderProps> = ({ title = "Cargando..." }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#F88D2A" />
      <Text style={styles.loadingText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
});