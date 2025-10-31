import { BadgeDollarSign } from "lucide-react-native";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
  Dimensions,
} from "react-native";
import { colors } from "src/design-system";
type Props = {
  company: { id: string; name: string; img: string };
  total_amount: number;
};
const CompanyHeader: React.FC<Props> = ({ company, total_amount }) => {
  return (
    <View style={styles.companyContainer}>
      <Image
        source={{
          uri: company.img
            ? company.img
            : "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
        }}
        style={styles.companyImage}
      />
      <Text style={styles.companyName}>{company.name}</Text>
      <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
        <BadgeDollarSign color={"#f88d2a"} />
        {total_amount === 0 ? (
          <Text style={{ fontSize: 16, color: "#f88d2a", fontWeight: "bold" }}>
            Gratis
          </Text>
        ) : (
          <Text style={{ fontSize: 16, paddingLeft: 2 }}>
            ${total_amount} BeCoins
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  companyContainer: {
    width: "90%",
    maxWidth: 600,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    margin: 8,
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
    borderWidth: 1,
    gap: 8,
  },
  companyImage: {
    width: "20%",
    height: "100%",
    minHeight: 80,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
  },
  companyName: { fontSize: 20 },
});

export default CompanyHeader;
