import { Copy } from "lucide-react-native";
import {
  View,
  Text,
  Touchable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
export const BankTransfer: React.FC = () => {
  const DatosCuenta = {
    titular: "Vargas Reyes Diego Vicente",
    banco: "Banco Guayaquil",
    cuenta: "Ahorro # 0005889133",
    email: "DIEGOVARGASREYES@GMAIL.COM",
    CI: "1705919668",
  };
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    alert("El texto fue copiado al portapapeles 📋");
  };
  return (
    <View>
      <Text style={styles.title}>Transferencia bancaria</Text>
      <Text style={styles.description}>Datos de la cuenta a transferir:</Text>
      <Text></Text>
      <View style={styles.bankRow}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Titular</Text>
          <Text style={styles.value}>{DatosCuenta.titular}</Text>
        </View>
      </View>
      <View style={styles.bankRow}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Banco</Text>
          <Text style={styles.value}>{DatosCuenta.banco}</Text>
        </View>
      </View>
      <View style={styles.bankRow}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Cuenta</Text>
          <Text style={styles.value}>{DatosCuenta.cuenta}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(DatosCuenta.cuenta);
          }}
        >
          <Copy />
        </TouchableOpacity>
      </View>
      <View style={styles.bankRow}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{DatosCuenta.email}</Text>
        </View>
      </View>
      <View style={styles.bankRow}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>C.I.</Text>
          <Text style={styles.value}>{DatosCuenta.CI}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(DatosCuenta.CI);
          }}
        >
          <Copy />
        </TouchableOpacity>
      </View>
      <Text style={styles.footerText}>Guarde el comprobante, el pago puede tardar hasta 72hs en impactar</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginVertical: 8,
    textDecorationLine: "underline",
  },
  bankRow: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    minWidth: 84,
    fontWeight: 700,
    color: "#111827",
  },
  value: {
    fontWeight: "bold",
    color: "#6b7280",
    lineHeight: 1.3,
  },
  footerText: {
    textAlign: "right",
  }
});
