import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ticket } from "lucide-react-native";
import { EventCard } from "./EventCard";
import { colors } from "src/styles";
import { AcquiredEventCard } from "./AcquiredEventCard";
import { Event } from "src/stores/Event";
import { useAuth } from "src/context";
import { Button } from "@/components/shared";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export const EventsList = ({ events, tab }: any) => {
  const { isAuthenticated } = useAuth();
  const { navigate } = useCustomNavigation();
  if (!events?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ticket color={colors.textSecondary} size={48} />
        {tab === "Disponibles" ? (
          <Text style={styles.emptyText}>
            No hay eventos disponibles por ahora.
          </Text>
        ) : (
          <>
            <Text style={styles.emptyText}>Aún no has adquirido eventos.</Text>
            {!isAuthenticated && (
                <>
                <Button
                  variant="inline"
                  title="Inicia Sesion"
                  onPress={() => navigate("Login")}
                />
                <Text style={styles.emptyText}> para adquirirlos.</Text>
              </>
            )}
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {events.map((event: Event) =>
        tab === "Disponibles" ? (
          <EventCard key={event.id} {...event} />
        ) : (
          <AcquiredEventCard key={event.user_pass_id} {...event} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 16,
    marginBottom: 80, // TODO chequear despues para vista celular
    justifyContent: "center",
  },
  emptyContainer: {
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
