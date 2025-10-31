import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ticket } from "lucide-react-native";
import { EventCard } from "./EventCard";
import { colors } from "src/styles";
import { AcquiredEventCard } from "./AcquiredEventCard";

export const EventsList = ({ events, tab }: any) => {
  if (!events?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ticket color={colors.textSecondary} size={48} />
        <Text style={styles.emptyText}>
          {tab === "available"
            ? "No hay eventos disponibles por ahora."
            : "Aún no has adquirido eventos."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {events.map((event: any, index: string) =>
        tab === "available" ? (
          <EventCard key={event.id} {...event} />
        ) : (
          <AcquiredEventCard key={event.id + index} {...event} />
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
    paddingHorizontal: 8,
    paddingVertical: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  emptyContainer: {
    flexDirection: "row",
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
