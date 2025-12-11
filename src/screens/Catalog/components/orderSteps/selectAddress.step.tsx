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
type AddressSelectorProps = {
  addresses: any[];
  loadingAddresses: boolean;
  onSubmit: (address: DeliveryAddress, addressId: string) => void;
  onCancel: () => void;
  onAddNew: () => void;
};
export const SelectAddress: React.FC<AddressSelectorProps> = ({
  addresses,
  loadingAddresses,
  onCancel,
  onSubmit,
  onAddNew,
}) => {
  if (loadingAddresses) {
    return <CustomLoader />;
  }
  const [displayAddress, setDisplayAddress] =
    useState<any[]>(addresses);
  const isMobile = Dimensions.get("window").width <= 600;
  const Wrapper = isMobile ? ScrollView : View;
  const handleDeleteAddress=(addressId: string) => {
    const res = userService.deleteAddressUser(addressId);
    setDisplayAddress(displayAddress.filter((a) => a.id !== addressId));
    notify.success({ message: "Dirección eliminada" });
  }
  return (
    <View style={styles.selectContainer}>
      <Wrapper style={isMobile ? null : styles.selectWrapper}>
        {addresses.length === 0 ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: "#666" }}>
              No tienes direcciones guardadas. Puedes agregar una nueva.
            </Text>
          </View>
        ) : (
          displayAddress.map((a, idx) => {
            const primary =
              a.addressLine1 || a.address_line_1 || a.street || a.address || "";
            const secondary =
              a.addressLine2 || a.address_line_2 || a.additionalInfo || "";
            const alias = a.alias || a.label || a.name || "";
            const city = a.city || a.town || "";
            const state = a.state || a.province || "";
            const postal = a.postalCode || a.postal_code || a.zip || "";

            let line1 = "";
            if (alias) line1 = alias;
            else if (primary) line1 = primary;
            else {
              const parts = [secondary, city, state, postal].filter(Boolean);
              line1 = parts.join(", ");
            }

            if (!line1) {
              const compact = [a.id, a.user_id, a.address, a.alias]
                .filter(Boolean)
                .join(" • ");
              line1 = compact || "(sin dirección)";
            }

            return (
              <View
                key={a.id || `${a.user_id || "addr"}-${idx}`}
                style={styles.addressCard}
              >
                <TouchableOpacity
                  onPress={() => handleDeleteAddress(a.id)}
                  style={styles.removeContainer}
                >
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
                <Text
                  style={{ fontWeight: "700", textTransform: "capitalize" }}
                >
                  {line1}
                </Text>
                <Text style={{ color: "#666", textTransform: "capitalize" }}>
                  {city}
                  {`, ${state}`}
                  {` • ${postal}`}
                </Text>

                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: 12,
                    color: "#666",
                    textTransform: "capitalize",
                  }}
                >
                  Referencia: {secondary ? secondary : "..."}
                </Text>

                <Button
                  title="Enviar orden"
                  onPress={() => onSubmit(a, a.id)}
                />
              </View>
            );
          })
        )}
      </Wrapper>

      <View style={styles.actionsContainer}>
        <Button
          title="Volver al carrito"
          onPress={() => onCancel()}
          variant="ghost"
        />
        <Button
          title=" Agregar nueva dirección"
          onPress={onAddNew}
          variant="secondary"
        />
      </View>
    </View>
  );
};
