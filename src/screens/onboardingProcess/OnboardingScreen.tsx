import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import StepRenderer from "./components/StepRenderer";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingContext } from "./context/OnboardingContext";

const OnboardingScreen = ({ route }: { route: any }) => {
  const { invited = false } = route.params ?? {};
  const { setInvited } = useOnboardingContext();

  useEffect(() => {
    setInvited(invited);
  }, [invited]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StepRenderer />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },

  container: {
    flex: 1,
  },
});
