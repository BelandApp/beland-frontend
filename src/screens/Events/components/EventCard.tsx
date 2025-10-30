import {
  ArrowBigRightDash,
  ArrowUp,
  BadgeDollarSign,
  Building2,
  Calendar,
  DollarSign,
  Heart,
  MapPin,
  SquareChevronUp,
  Tickets,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { Card } from "src/components/ui";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";

import { StackNavigationProp } from "@react-navigation/stack";
import { Event } from "src/stores/Event";
import { colors } from "src/styles";

type EventScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EventModal"
>;
export const EventCard: React.FC<Event> = ({
  id,
  name,
  image_url,
  event_date,
  event_place,
  event_city,
  price_becoin,
  end_sale_date,
  user_attended,
}) => {
  const navigation = useNavigation<EventScreenNavigationProp>();
  if (!id) return null;
   const { width } = Dimensions.get("window");
  return (
    <Pressable
      key={id}
      onPress={() => navigation.navigate("EventModal", { id: id })}
      style={[styles.card,{width: width > 600 ? 600 : width-5}]}
    >
      {/* Badges */}
      {/* No deberian superponerse, si ya fue adquirido solo mostramos ese */}
      {!user_attended &&
        end_sale_date &&
        new Date(end_sale_date).getTime() < Date.now() && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Finalizado</Text>
          </View>
        )}
      {user_attended && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Usado</Text>
        </View>
      )}
      {/* Main Image */}
      <Image source={{ uri: image_url }} style={styles.image} />
      {/* Container */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eventName} numberOfLines={2} ellipsizeMode="tail">
            {name}
          </Text>
          <View style={styles.infoContainer}>
            <Tickets color={"white"} />
            <Text style={styles.eventText}>{name}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Calendar color={"white"} />
            <Text
              style={styles.eventText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {event_date ? new Date(event_date).toLocaleDateString() : ""}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <MapPin color={"white"} />
            <Text
              style={styles.eventText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {event_place}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Building2 color={"white"} />
            <Text
              style={styles.eventText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {event_city}
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.textContainer}>
            <BadgeDollarSign color={colors.belandOrange} />
            <Text style={styles.eventPrice}>{price_becoin} Becoin</Text>
          </View>
          <SquareChevronUp />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    position: "relative",
    height: Platform.OS === "web" ? 400 : 200,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "white",
    boxShadow:
      "rgba(0, 0, 0, 0.1) 4px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;",
  },
  image: {
    width: "35%",
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    resizeMode: "cover",
    overflow: "hidden",
  },
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingRight: 16,
    flex: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.belandGreen,
  },
  badge: {
    position: "absolute",
    top: 20,
    right: -35,
    transform: [{ rotate: "45deg" }],
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 40,
    paddingVertical: 5,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "500",
  },
  header: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventName: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  eventText: {
    fontSize: 20,
    fontWeight: "500",
    color: "white",
  },
  eventPrice: {
    fontSize: 25,
    fontWeight: "500",
    color: colors.belandOrange,
  },
  infoContainer: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    paddingRight: 10,
    paddingVertical: 4,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.belandGreen,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
