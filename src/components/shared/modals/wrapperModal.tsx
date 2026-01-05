import { ArrowDown } from "lucide-react-native";
import { Dimensions, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { colors } from "src/styles";
import { toastConfig } from "../notification/GlobalNotification";
import { useEffect, useRef, ComponentRef } from "react";
import { Button } from "../buttons";
import RBSheet from "react-native-raw-bottom-sheet";
const SCREEN_HEIGHT = Dimensions.get("window").height;

type RBSheetRef = ComponentRef<typeof RBSheet>;

type WrapperModalProps = {
  isOpen: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  content: React.ReactNode;
  actions: React.ReactNode;
  headerBackgroundColor?: string;
};

export const WrapperModal: React.FC<WrapperModalProps> = ({
  content,
  actions,
  header,
  isOpen,
  onClose,
  headerBackgroundColor,
}) => {
  const refRBSheet = useRef<RBSheetRef>(null);

  useEffect(() => {
    if (isOpen) {
      refRBSheet.current?.open();
    } else {
      refRBSheet.current?.close();
    }
  }, [isOpen]);

  return (
    <RBSheet
      ref={refRBSheet}
      // useNativeDriver={true}
      draggable={true}
      dragOnContent={true}
      height={SCREEN_HEIGHT * 0.85}
      onClose={onClose}
      customStyles={{
        wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
        container: styles.sheetContainer,
        draggableIcon: styles.dragHandle,
      }}
    >
      <View style={styles.mainContainer}>
        {/* HEADER */}
        <View
          style={[
            styles.header,
            headerBackgroundColor
              ? { backgroundColor: headerBackgroundColor }
              : null,
          ]}
        >
          {header}
          <Button
            variant="onlyIcon"
            icon={<ArrowDown color={colors.belandOrange} />}
            onPress={() => refRBSheet.current?.close()}
            title="cerrar"
          />
        </View>

        {/* CONTENT */}
        <View style={styles.contentWrapper}>{content}</View>

        {/* FOOTER */}
        <View style={styles.footer}>{actions}</View>
      </View>

      <Toast config={toastConfig} />
    </RBSheet>
  );
};
export default WrapperModal;

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // Eliminamos el height de aquí porque RBSheet lo maneja por prop
  },
  mainContainer: {
    flex: 1, // Ocupa todo el alto del RBSheet (85% de la pantalla)
  },
  header: {
    width: "100%",
    paddingHorizontal: 16,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  contentWrapper: {
    flex: 1, // Esto es lo que hace que el contenido sea flexible
    padding: 16,
  },
  footer: {
    padding: 16,
    paddingBottom: 34, // Espacio extra para el área segura de iOS/Android
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    backgroundColor: colors.background,
  },
  dragHandle: {
    backgroundColor: "#D1D5DB",
    width: 50,
    height: 5,
    marginTop: 10,
  },
});
