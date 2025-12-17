import { SquareChevronDown } from "lucide-react-native";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { useCustomNavigation } from "src/hooks";
import { colors } from "src/styles";
import { toastConfig } from "../notification/GlobalNotification";
type WarpperModalProps = {
  content: React.ReactNode;
  actions: React.ReactNode;
};
const WarpperModal: React.FC<WarpperModalProps> = ({ content, actions }) => {
   const { goBack } = useCustomNavigation();
  return (
    <Modal
      backdropOpacity={0.3}
      isVisible={true}
      onBackdropPress={goBack}
      onSwipeComplete={goBack}
      propagateSwipe
      style={styles.modal}
      swipeDirection="down"
    >
      <View style={styles.header}>
        <Pressable onPress={goBack}>
          <SquareChevronDown color={colors.textSecondary} size={26} />
        </Pressable>
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
    marginTop: 15
  },
  header: {
    height: 38,
    alignItems: "flex-end",
    justifyContent: "center",
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
