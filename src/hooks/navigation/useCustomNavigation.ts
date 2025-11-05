import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";

export const useCustomNavigation = () => { 
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigate = navigation.navigate;
  return { navigate };
};