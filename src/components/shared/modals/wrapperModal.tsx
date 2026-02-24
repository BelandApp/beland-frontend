import { ArrowDown, ArrowDownCircle } from "lucide-react-native";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
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
  actions?: React.ReactNode;
  headerBackgroundColor?: string;
  beforeClose?: () => boolean | Promise<boolean>;
};

export const WrapperModal: React.FC<WrapperModalProps> = ({
  content,
  actions,
  header,
  isOpen,
  onClose,
  beforeClose,
}) => {
  const refRBSheet = useRef<RBSheetRef>(null);

  useEffect(() => {
    if (isOpen) {
      refRBSheet.current?.open();
    } else {
      refRBSheet.current?.close();
    }
  }, [isOpen]);

  const handleRequestClose = async () => {
    if (beforeClose) {
      const shouldClose = await beforeClose();
      if (!shouldClose) return;
    }

    onClose();
  };
  return (
    <RBSheet
      ref={refRBSheet}
      draggable={true}
      dragOnContent={false}
      onClose={onClose}
      height={
        Platform.OS === "web" ? SCREEN_HEIGHT * 0.98 : SCREEN_HEIGHT * 0.9
      }
      closeOnPressMask={false}
      customStyles={{
        wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
        container: styles.sheetContainer,
        draggableIcon: styles.dragHandle,
      }}
    >
      <View style={styles.mainContainer}>
        {/* HEADER */}
        <View style={[styles.header]}>
          {header}
          <Button
            variant="onlyIcon"
            icon={<ArrowDown color={colors.belandOrange} size={24} />}
            onPress={handleRequestClose}
            title="cerrar"
          />
        </View>

        {/* CONTENT */}
        <View style={styles.contentWrapper}>{content}</View>

        {/* FOOTER */}
        {actions && <View style={styles.footer}>{actions}</View>}
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
    flex: 1,
    // @ts-ignore - Esta propiedad es específica para Web para evitar selecciones y tener desplazamiento fluido
    userSelect: "none",
    // @ts-ignore
    WebkitUserSelect: "none",
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
    gap: 8,
  },
  contentWrapper: {
    flex: 1, // Esto es lo que hace que el contenido sea flexible
    padding: 16,
    overflow: "hidden",
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
