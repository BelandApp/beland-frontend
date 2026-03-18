import { useNavigation, NavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "src/components/layout/RootStackNavigator";

export const useCustomNavigation = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
