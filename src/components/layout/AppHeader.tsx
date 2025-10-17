import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserMenu } from "../ui/UserMenu";
import BelandLogo2 from "../icons/BelandLogo2";
import { colors } from "src/styles";

interface AppHeaderProps {
  variant?: "invisible" | "home";
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant = "invisible",
}) => {
  const navigation = useNavigation();

  if (variant === "home") {
    return (
      <View style={styles.homeHeader}>
        <View style={styles.homeHeaderContent}>
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => navigation.navigate("Home" as never)}
          >
            <BelandLogo2 width={120} height={32} />
          </TouchableOpacity>
          <UserMenu iconColor="#334155" variant="full" />
        </View>
      </View>
    );
  }

  // Header invisible por defecto que no interfiere con el diseño de las pantallas
  return <View style={styles.invisibleHeader} />;
};

const styles = StyleSheet.create({
  invisibleHeader: {
    height: 0,
    backgroundColor: "transparent",
  },

  homeHeader: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 20 : 50, // Reducido para Android porque la barra de estado está oculta
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex:1
  },

  homeHeaderContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoContainer: {
    backgroundColor: "#FFF",
    borderRadius: 24,
  },
});
