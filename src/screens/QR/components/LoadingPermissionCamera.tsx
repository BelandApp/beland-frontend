import React from "react";

import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";

export const LoadingPermissionCamera = () => {
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.centerContent}>
        <Text style={styles.message}>Solicitando permisos de cámara...</Text>
      </View>
    </SafeAreaView>
  );
};
