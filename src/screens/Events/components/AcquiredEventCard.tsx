import {
  Building2,
  Calendar,
  MapPin,
  SquareChevronUp,
} from "lucide-react-native";
import React, { useState, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Event } from "src/stores/Event";
import { colors } from "src/styles";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export const AcquiredEventCard: React.FC<Event> = ({
  id,
  name,
  image_url,
  images_urls,
  event_date,
  event_place,
  event_city,
  price_becoin,
  end_sale_date,
  user_attended,
  holder_name,
  user_pass_id,
}) => {
  const { navigate } = useCustomNavigation();

  if (!id || !user_pass_id) return null;
  const handleNavigation = () => {
    return navigate("AcquiredEventModal", { id_modal: user_pass_id });
  };
  const [activeIndex, setActiveIndex] = useState(0);
  const windowWidth = Dimensions.get("window").width;
  const isMobileWeb = Platform.OS === "web" && windowWidth < 600;
  const IMAGE_WIDTH = isMobileWeb ? 100 : 140;

  const imgs =
    images_urls && images_urls.length
      ? images_urls
      : image_url
      ? [image_url]
      : [];

  return (
    <Pressable
      key={id}
      onPress={handleNavigation}
      style={[styles.card, isMobileWeb && styles.cardMobileWeb]}
    >
      {/* Badge: usado/finalizado */}
      {!user_attended &&
        end_sale_date &&
        new Date(end_sale_date).getTime() < Date.now() && (
          <View style={[styles.badge, styles.badgeFinish]}>
            <Text style={styles.badgeText}>Finalizado</Text>
          </View>
        )}
      {user_attended && (
        <View style={[styles.badge, styles.badgeUsed]}>
          <Text style={styles.badgeText}>Usado</Text>
        </View>
      )}

      {/* Image carousel */}
      <View
        style={[
          styles.carouselWrapper,
          { width: IMAGE_WIDTH, height: IMAGE_WIDTH },
        ]}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const index = Math.round(x / IMAGE_WIDTH);
            setActiveIndex(index);
          }}
          ref={useRef<ScrollView>(null)}
        >
          {imgs.map((src: string, idx: number) => (
            <Image
              key={idx}
              source={{ uri: src }}
              style={[
                styles.image,
                { width: IMAGE_WIDTH, height: IMAGE_WIDTH },
              ]}
            />
          ))}
        </ScrollView>
        <View style={styles.dotsContainer}>
          {imgs.map((_, i: number) => (
            <View
              key={i}
              style={[styles.dot, activeIndex === i && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.eventName, isMobileWeb && styles.eventNameMobile]}
          numberOfLines={isMobileWeb ? 3 : 2}
          ellipsizeMode="tail"
        >
          {name}
        </Text>

        <View style={styles.metaRowSmall}>
          <Calendar color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {event_date ? new Date(event_date).toLocaleDateString() : ""}
          </Text>
        </View>

        <View style={styles.metaRowSmall}>
          <MapPin color={colors.textSecondary} />
          <Text style={styles.metaText}>{event_place || event_city}</Text>
        </View>
      </View>

      <View style={[styles.rightCol, isMobileWeb && styles.rightColMobile]}>
        <Text style={styles.destLabel}>Destinado a</Text>
        <Text
          style={[styles.holderText, isMobileWeb && styles.holderTextMobile]}
          numberOfLines={isMobileWeb ? 2 : 2}
          ellipsizeMode="tail"
        >
          {holder_name}
        </Text>
        <SquareChevronUp color={colors.textSecondary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "white",
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 8,
    resizeMode: "cover",
  },
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingLeft: 12,
    flex: 1,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
    borderRadius: 6,
  },
  badgeFinish: {
    backgroundColor: colors.belandOrange,
  },
  badgeUsed: {
    backgroundColor: colors.error,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  header: {
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-start",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  eventText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  holderText: {
    paddingLeft: 2,
    fontSize: 18,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },
  carouselWrapper: {
    width: 140,
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  metaRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  rightCol: {
    width: 140,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 12,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.15)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.belandGreen,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
  },
  /* Mobile web adjustments */
  cardMobileWeb: {
    padding: 10,
  },
  eventNameMobile: {
    fontSize: 16,
    fontWeight: "700",
  },
  holderTextMobile: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "right",
  },
  rightColMobile: {
    width: 100,
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  qrBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  destLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 2,
  },
  ticketBox: {
    width: 120,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  ticketHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 6,
  },
  ticketTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  ticketId: {
    fontSize: 11,
    color: colors.textSecondary,
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
