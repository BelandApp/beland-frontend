import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { CircleArrowLeftIcon } from "lucide-react-native";
import { TouchableOpacity, StyleSheet} from "react-native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { colors } from "src/styles";

export const GoBackButton: React.FC = () => {
   const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={styles.backbutton}
      onPress={() => navigation.goBack()}
    >
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