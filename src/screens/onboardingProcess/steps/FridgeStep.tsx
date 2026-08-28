import React from "react";

import { Button, Slider } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { ProductCard } from "src/screens/Catalog/components";
import { ProductService } from "src/services";
import { useResponsiveLayout } from "src/hooks";
import { Text } from "react-native";

export const FridgeStep = () => {
  const { next, indexState } = useOnboardingContext();
  const data = ProductService.getProducts();
  const { isMobile, screenWidth } = useResponsiveLayout();
  const SPACING = 16;
  const CARD_WIDTH = isMobile ? screenWidth * 0.4 : screenWidth / 3.2;
  const ITEMS_PER_PAGE = isMobile ? 2 : 6;
  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={<Button title="Genial" variant="primary" onPress={next} />}
    >
      <Step
        title="Y si aprovechamos?"
        subtitle="Ademas de retirar tus residuos separados podemos llevarte los productos que compres en nuestras tiendas"
      >
        <Slider
          renderItem={ProductCard}
          data={data}
          CARD_WIDTH={CARD_WIDTH}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          SPACING={SPACING}
        />
        <Text>
          Solo tienes que elegir los productos, añadir a tu carrito, y abonar!
        </Text>
      </Step>
    </StepLayout>
  );
};

export default FridgeStep;
