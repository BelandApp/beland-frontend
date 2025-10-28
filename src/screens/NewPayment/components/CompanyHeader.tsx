import React from "react";
import { Image, Platform, StyleSheet, View, Text } from "react-native";
import { colors } from "src/design-system";
type Props = {
  company: { id: string; name: string; img: string };
}
const CompanyHeader: React.FC<Props> = ({ company }) => {
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
    </View>
  );
};

const styles = StyleSheet.create({
  companyContainer: {
    width: Platform.OS === "web" ? 600 : "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    margin: 8,
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
    borderWidth: 1,
    gap: 16,
  },
  companyImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
  },
  companyName: { fontSize: 20 },
});

export default CompanyHeader;
