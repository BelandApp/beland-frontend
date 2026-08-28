import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import SplashContent from "./SplashContent";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { DeepLinkService } from "src/services/deepLink/deepLink.service";
import { useOnboardingContext } from "../onboardingProcess/context/OnboardingContext";

export const AppGate = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { hasCompleted, isLoading } = useOnboardingContext();

  useEffect(() => {
    if (isLoading) return;

    const bootstrap = async () => {
      // 1. Usuario nuevo
      if (!hasCompleted) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Onboarding" }],
        });

        return;
      }

      // 2. ¿Hay un deep link pendiente?
      const intent = await DeepLinkService.getIntent();

      if (intent) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: intent.screen as keyof RootStackParamList,
              params: intent.params,
            },
          ],
        });

        await DeepLinkService.clearIntent();
        return;
      }

      // 3. Flujo normal
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "MainTabs",
            params: {
              screen: "Home",
            },
          },
        ],
      });
    };

    bootstrap();
  }, [isLoading, hasCompleted]);

  return <SplashContent />;
};

export default AppGate;
