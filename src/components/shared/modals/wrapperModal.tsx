import { SquareChevronDown } from "lucide-react-native";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { useCustomNavigation } from "src/hooks";
import { colors } from "src/styles";
import { toastConfig } from "../notification/GlobalNotification";
import { useState } from "react";
type WarpperModalProps = {
  visible: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  content: React.ReactNode;
  actions: React.ReactNode;
};
const WarpperModal: React.FC<WarpperModalProps> = ({ content, actions,header,visible, onClose }) => {
  const { goBack } = useCustomNavigation();
  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.3}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      propagateSwipe
      style={styles.modal}
    >
      <View style={styles.header}>
        {header ? (
          header
        ) : (
          <Pressable
            onPress={() => goBack()}
            style={{ alignSelf: "flex-end", marginVertical: 10 }}
          >
            <SquareChevronDown color={colors.textSecondary} size={26} />
          </Pressable>
        )}
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
      <View style={styles.footer}>{actions}</View>
      <Toast config={toastConfig} />
    </Modal>
  );
};

export default WarpperModal;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    marginTop: Platform.OS !== "web" ? Dimensions.get("window").height * 0.05 : 15
  },
  header: {
    minHeight: 38,
    width: "100%",
    paddingHorizontal: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    maxHeight: Dimensions.get("window").height * 0.5,
  },
});
