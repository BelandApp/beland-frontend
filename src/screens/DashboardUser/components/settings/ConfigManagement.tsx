import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  ThemedHeader,
  useThemedTabs,
  ThemedTabs,
  Button,
} from "src/components";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useConfig } from "../../hooks/useConfig";
import LocationsSection from "./Config/LocationsSection";

export const ConfigManagement = () => {
  const { navigate } = useCustomNavigation();
  const { tabs, onTabChange, activeTab } = useThemedTabs(["Ubicaciones"]);

  return (
    <View>
      <ThemedHeader
        title="Configuración"
        canGoBack
        onBackPress={() =>
          navigate("UserDashboardScreen", { screen: "Dashboard" })
        }
      />
      <View style={styles.section}>
        <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
        {activeTab === "Ubicaciones" && <LocationsSection />}
      </View>
    </View>
  );
};

export default ConfigManagement;

const styles = StyleSheet.create({
  section: {
    padding: 12,
  },
});
