// src/components/UserDashboard.tsx

import React from "react";
import { useAuth } from "src/hooks/AuthContext";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import SuperAdminPanel from "./components/SuperAdminPanel";
import AdminPanel from "./components/AdminPanel";
import LeaderPanel from "./components/LeaderPanel";
import EmpresaPanel from "./components/EmpresaPanel";
import UserPanel from "./components/UserPanel";

const UserDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  // Se ha actualizado el tipo para la propiedad `role` en la interfaz AuthUser
  // para que coincida con el backend, pero para esta corrección,
  // la solución es usar `user.role_name`.
  if (!user || !user.role_name) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No se pudo cargar la información del usuario o el rol no está
          definido. Intente iniciar sesión nuevamente.
        </Text>
      </View>
    );
  }

  // La corrección está en esta línea: se usa user.role_name en lugar de user.role
  switch (user.role_name) {
    case "SUPERADMIN":
      return <SuperAdminPanel user={user}/>;
    case "ADMIN":
      return <AdminPanel user={user} />;
    case "LEADER":
      return <LeaderPanel user={user} />;
    case "EMPRESA":
      return <EmpresaPanel user={user} />;
    case "USER":
      return <UserPanel user={user} />;
    default:
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>
            No se reconoce tu rol. Contacta al soporte.
          </Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default UserDashboard;
