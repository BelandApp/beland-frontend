import { useNavigation, NavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";

export const useCustomNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const navigate = navigation.navigate;

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };
  const reload = (route: { name: any; params: any }) => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: route.name,
          params: route.params,
        },
      ],
    });
  };

  return { navigate, goBack, reload };
};
