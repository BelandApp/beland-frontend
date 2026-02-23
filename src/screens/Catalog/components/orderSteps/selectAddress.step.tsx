import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Button, CustomLoader } from "src/components";
import { OrderDeliveryModalStyles as styles } from "./styles";
import { DeliveryAddress } from "src/types";
import { userService } from "src/services/user/user.service";
import { notify } from "src/hooks/notification/notify.external";
import { useState } from "react";
import { useResponsiveLayout } from "@/hooks";
import { FlatList } from "react-native-gesture-handler";
type AddressSelectorProps = {
  addresses: any[];
  loadingAddresses: boolean;
  onSubmit: (address: DeliveryAddress, addressId: string) => void;
};

export const SelectAddress: React.FC<AddressSelectorProps> = ({
  addresses,
  loadingAddresses,
  onSubmit,
}) => {
  if (loadingAddresses) {
    return <CustomLoader />;
  }
  const [displayAddress, setDisplayAddress] = useState<any[]>(addresses);
  const handleDeleteAddress = (addressId: string) => {
    const res = userService.deleteAddressUser(addressId);
    setDisplayAddress(displayAddress.filter((a) => a.id !== addressId));
    notify.success({ message: "Dirección eliminada" });
  };

  const AddressCard = ({ item }: { item: any }) => (
    <View style={styles.addressCard}>
      <TouchableOpacity
        onPress={() => handleDeleteAddress(item.id)}
        style={styles.removeContainer}
      >
        <Text style={styles.remove}>✕</Text>
      </TouchableOpacity>
      <Text style={{ fontWeight: "700", textTransform: "capitalize" }}>
        {item.addressLine1}
      </Text>
      <Text style={{ color: "#666", textTransform: "capitalize" }}>
        {item.city}
        {`, ${item.state}`}
        {` • ${item.postal}`}
      </Text>

      <Text
        numberOfLines={2}
        style={{
          fontSize: 12,
          color: "#666",
          textTransform: "capitalize",
        }}
      >
        Referencia: {item.addressLine2 ? item.addressLine2 : "..."}
      </Text>

      <Button
        title="Enviar orden"
        onPress={() => onSubmit(item, item.id)}
        disabled={loadingAddresses}
      />
    </View>
  );
  return (
    <View style={styles.selectContainer}>
      <FlatList
        data={displayAddress}
        renderItem={AddressCard}
        contentContainerStyle={{ gap: 8 }}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <Text style={{ color: "#666" }}>
              No tienes direcciones guardadas. Puedes agregar una nueva.
            </Text>
          </View>
        }
      />
    </View>
  );
};
