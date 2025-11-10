import { CircleArrowLeftIcon } from "lucide-react-native";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { colors } from "src/styles";

export const GoBackButton: React.FC = () => {
  const { goBack } = useCustomNavigation();
  return (
    <TouchableOpacity style={styles.backbutton} onPress={() => goBack()}>
      <CircleArrowLeftIcon size={32} color="#FFF" />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  backbutton: {
    padding: 8,
    backgroundColor: colors.belandOrange,
    color: "white",
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
    borderRadius: 50,
  },
});
