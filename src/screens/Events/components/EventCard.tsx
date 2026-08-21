import {
  BadgeDollarSign,
  Building2,
  Calendar,
  MapPin,
  SquareChevronUp,
  Tickets,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, Text, Image } from "react-native";
import { Event } from "src/stores/Event";
import { colors } from "src/styles";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { convertBeCoinsToUSD, formatUSDPrice } from "src/constants/currency";
import { EventModal } from "../Event.modal";

export const EventCard: React.FC<Event> = ({
  id,
  name,
  image_url,
  event_date,
  event_place,
  event_city,
  price_usd,
  end_sale_date,
  user_attended,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!id) return null;
  const isFree = price_usd === "0.00" || price_usd === null;
  const now = new Date();

  const isEventFinished = event_date && new Date(event_date) < now;
  return (
    <>
      <Pressable key={id} onPress={() => setIsOpen(true)} style={styles.card}>
        {/* Badges */}
        {/* No deberian superponerse, si ya fue adquirido solo mostramos ese */}
        {isEventFinished && (
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
        <Image
          source={{ uri: image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Container */}
        <View style={styles.container}>
          <View style={styles.header}>
            <Text
              style={styles.eventName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
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
            {!isFree ? (
              <View style={styles.priceSection}>
                <View style={styles.textContainer}>
                  <BadgeDollarSign color={colors.belandOrange} />
                  <Text style={styles.eventPrice}>{price_usd} Usd</Text>
                </View>
                {/* Badge de precio en USD más distintivo */}
                <View style={styles.usdBadge}>
                  <Text style={styles.usdBadgeLabel}>≈ </Text>
                  <Text style={styles.usdBadgePrice}>
                    ${formatUSDPrice(convertBeCoinsToUSD(Number(price_usd)))}
                  </Text>
                  <Text style={styles.usdBadgeCurrency}> USD</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.freeSection}>Free</Text>
            )}
            <SquareChevronUp />
          </View>
        </View>
      </Pressable>
      <EventModal id={id} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 600,
    flexDirection: "row",
    position: "relative",
    height: 400,
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
    color: "white",
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
  priceSection: {
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-start",
  },
  freeSection: {
    paddingRight: 10,
    paddingVertical: 4,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.belandOrange,
    color: "white",
    fontSize: 25,
    fontWeight: 600,
  },
  usdBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.belandOrange,
  },
  usdBadgeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.belandOrange,
  },
  usdBadgePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  usdBadgeCurrency: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.belandOrange,
    opacity: 0.8,
  },
});
