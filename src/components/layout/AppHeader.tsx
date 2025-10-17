import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserMenu } from "../ui/UserMenu";
import BelandLogo2 from "../icons/BelandLogo2";

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
    backgroundColor: "#F8FAFC",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  homeHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoContainer: {
    flex: 1,
  },
});
