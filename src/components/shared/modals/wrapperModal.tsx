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
import { Animated, Easing } from "react-native";
import { useRef, useState } from "react";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.55;
const EXPANDED_HEIGHT = SCREEN_HEIGHT;

type WarpperModalProps = {
  visible: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  content: React.ReactNode;
  actions: React.ReactNode;
};
const WarpperModal: React.FC<WarpperModalProps> = ({ content, actions,header,visible, onClose }) => {
  const { goBack } = useCustomNavigation();
  const heightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  const [expanded, setExpanded] = useState(false);
const expandModal = () => {
  if (expanded) return;

  setExpanded(true);
  Animated.timing(heightAnim, {
    toValue: EXPANDED_HEIGHT,
    duration: 280,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false,
  }).start();
};

const collapseModal = () => {
  setExpanded(false);
  Animated.timing(heightAnim, {
    toValue: COLLAPSED_HEIGHT,
    duration: 220,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false,
  }).start();
};
const lastScrollY = useRef(0);

const handleScroll = (e: any) => {
  const y = e.nativeEvent.contentOffset.y;

  // si está arriba y hace gesto hacia arriba → expandir
  if (y <= 0 && lastScrollY.current > y) {
    expandModal();
  }

  lastScrollY.current = y;
};


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
      <Animated.View style={[styles.container, { height: heightAnim }]}>
        <View style={styles.header}>
          {header ? (
            header
          ) : (
            <Pressable
              onPress={expanded ? collapseModal : goBack}
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {content}
        </ScrollView>
        <View style={styles.footer}>{actions}</View>
      </Animated.View>
      <Toast config={toastConfig} />
    </Modal>
  );
};

export default WarpperModal;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
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
  },
});