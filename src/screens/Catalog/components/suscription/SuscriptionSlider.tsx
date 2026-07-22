import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, ListRenderItemInfo, Text, View } from "react-native";

import SubscriptionCard from "./SuscriptionCard";
import { Button, WrapperModal } from "src/components";
import { LucideLeaf } from "lucide-react-native";
import { useResponsiveLayout } from "src/hooks";
import { useCartStore } from "src/stores";
import { Product } from "src/types";
import Slider from "src/components/shared/slider/Slider";

interface SubscriptionProps {
  circularProducts: Product[];
}

const SubscriptionSlider: React.FC<SubscriptionProps> = ({
  circularProducts,
}) => {
  const [itemModal, setItemModal] = useState<Product | null>(null);
  const { isMobile, screenWidth } = useResponsiveLayout();
  const { addProduct, setShowCart } = useCartStore();
  const SPACING = 16;
  const CARD_WIDTH = isMobile ? screenWidth * 0.8 : screenWidth / 3.2;
  const ITEMS_PER_PAGE = isMobile ? 1 : 3;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <SubscriptionCard
        product={item}
        width={CARD_WIDTH}
        onPress={() => setItemModal(item)}
      />
    ),
    [CARD_WIDTH],
  );

  const addItem = () => {
    if (itemModal === null) return;
    addProduct({ ...itemModal, quantity: 1 });
    setItemModal(null);
    setShowCart(true);
  };

  return (
    <>
      <View className="gap-2">
        <Text className="text-lg uppercase tracking-widest text-beland-green-500">
          Producción circular
        </Text>
        <Text className="mb-4 text-2xl font-semibold">
          Productos con historia
        </Text>
        <Slider
          data={circularProducts}
          renderItem={renderItem}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          CARD_WIDTH={CARD_WIDTH}
          SPACING={SPACING}
        />
      </View>
      {itemModal !== null && (
        <WrapperModal
          isOpen={itemModal ? true : false}
          onClose={() => setItemModal(null)}
          header={
            <View className="flex flex-row gap-2">
              <LucideLeaf color="green" />
              <Text className="text-lg text-beland-orange-500 font-semibold">
                {itemModal?.name}
              </Text>
            </View>
          }
          content={
            <View>
              <Image
                source={{ uri: itemModal?.image_url }}
                className="w-full h-[200px] "
                resizeMode="contain"
              />
              <Text className="italic text-lg font-semibold text-neutral-500">
                {itemModal?.description}
              </Text>
              <Text>Precio ${itemModal?.price}</Text>
              {/* {itemModal?.features.map((feat) => (
                <Text className="text-white font-semibold text-2xl bg-beland-orange-200 my-2 rounded-xl sm:w-[30%] px-2">
                  {feat}
                </Text>
              ))} */}
            </View>
          }
          actions={
            <View className="flex flex-col sm:flex-row gap-2 justify-evenly">
              <Button title="Suscribirse" onPress={() => {}} disabled />
              <Button title="Comprar" onPress={addItem} />
            </View>
          }
        />
      )}
    </>
  );
};

export default SubscriptionSlider;
