// src/pages/DashboardPage.tsx
import React from "react";
import UserDashboard from "./DashboardUser/UserDashboard";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DashboardPage: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Aquí puedes añadir un Navbar o Sidebar global */}
      <UserDashboard />
    </SafeAreaView>
  );
};

export default DashboardPage;
