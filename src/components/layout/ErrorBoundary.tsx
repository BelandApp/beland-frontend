import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Button, ThemedHeader } from "../shared";
import { colors } from "src/styles";
import { BelandLogo } from "../icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // AGREGAR LOGICA PARA REPORTAR ERRORES A UN SERVICIO DE MONITOREO
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={() => this.setState({ hasError: false })}
            >
              <BelandLogo width={120} height={32} />
            </TouchableOpacity>
          </View>
          <View style={styles.container}>
            <Text style={styles.title}>
              ¡Ups! Estamos teniendo inconvenientes para mostrarte este
              contenido.
            </Text>
            <Text style={styles.subtitle}>Vuelve a intentarlo.</Text>
            <Button
              title="Reintentar"
              onPress={() => this.setState({ hasError: false })}
            />
          </View>
        </>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 20 : 50,
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
    zIndex: 1,
    minHeight: Platform.OS === "web" ? 85 : 130,
  },
  logoContainer: { backgroundColor: "#FFF", borderRadius: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 20 },
  button: { backgroundColor: "#007AFF", padding: 12, borderRadius: 8 },
  buttonText: { color: "white", fontWeight: "bold" },
});
