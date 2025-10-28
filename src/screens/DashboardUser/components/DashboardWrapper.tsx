import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Text,
} from "react-native";
import { ThemedHeader } from "src/components/shared/headers/Header";

interface DashboardWrapperProps {
  title: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  title,
  isLoading,
  children,
}) => {
  return (
    <View style={styles.container}>
      <ThemedHeader title={title} canGoBack />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        alwaysBounceVertical={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    flexGrow: 1,
    minHeight: "150%", // Forzar altura mínima
    paddingBottom: 200,
  },
  content: {
    padding: 20,
    minHeight: 1000, // Altura mínima forzada
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default DashboardWrapper;
