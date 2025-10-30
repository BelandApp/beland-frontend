import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { CheckCheckIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { colors } from "src/design-system";

export const ConsumedEventScreen = ({ route }: { route: any }) => {
  const { id } = route.params;
   const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <>
      <ThemedHeader title="Entrada" canGoBack />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={styles.container}>
          <CheckCheckIcon
            color={"white"}
            size={54}
            style={styles.checkContainer}
          />
          <Text style={styles.title}>
            Tu entrada está validada, enseña esto en la puerta del evento
          </Text>
          <Text>ID Validado: {id}</Text>
        <Pressable
            onPress={() => navigation.navigate("MainTabs")}
            style={styles.button}
        >
          <Text style={{color: "white", fontWeight: "bold"}}>Inicio</Text>
        </Pressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 32,
    backgroundColor: "white",
    width: "80%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkContainer: {
    padding: 16,
    borderRadius: 50,
    backgroundColor: colors.brand.orange[500],
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.brand.green[500],
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
  }
});
