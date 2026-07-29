import React from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

import { Button, ProgressDots } from "@/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingContext } from "../context/OnboardingContext";
import { useCustomNavigation } from "src/hooks";

interface StepLayoutProps {
  children: React.ReactNode;

  footer?: React.ReactNode;

  showProgress?: boolean;

  currentStep?: number;

  totalSteps?: number;

  scrollable?: boolean;
}

const StepLayout = ({
  children,
  footer,
  showProgress = true,
  currentStep = 0,
  totalSteps = 0,
  scrollable = false,
}: StepLayoutProps) => {
  const Content = scrollable ? ScrollView : View;
  const { complete, reset } = useOnboardingContext();
  const { reload } = useCustomNavigation();
  const handleSkip = () => {
    complete();
    reset();
    reload({ name: "MainTabs", params: { screen: "Home" } });
  };
  return (
    <SafeAreaView style={styles.container}>
      <Content
        style={styles.content}
        contentContainerStyle={scrollable ? styles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </Content>

      {footer && <View style={styles.footer}>{footer}</View>}
      {showProgress && (
        <View style={styles.progress}>
          <ProgressDots current={currentStep} total={totalSteps} />
          <Button
            variant="box"
            title="Skip"
            onPress={handleSkip}
            className="border-none"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default React.memo(StepLayout);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },

  progress: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: "auto",
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  scrollContent: {
    flexGrow: 1,
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    backgroundColor: "#FAFBFC",
    marginHorizontal: "auto",
  },
});
