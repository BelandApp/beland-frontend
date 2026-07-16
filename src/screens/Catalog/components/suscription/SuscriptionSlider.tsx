import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import SubscriptionCard from "./SuscriptionCard";
import { CircularProduct } from "./type";
import { Button, WrapperModal } from "src/components";
import { LucideLeaf } from "lucide-react-native";

interface SubscriptionProps {
  products: CircularProduct[];
}

const SPACING = 16;
const AUTO_SCROLL_INTERVAL = 4000;
const ITEMS_PER_PAGE = 3;
const SubscriptionSlider: React.FC<SubscriptionProps> = ({ products }) => {
  const [itemModal, setItemModal] = useState<CircularProduct | null>(null);
  const { width } = useWindowDimensions();
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const CARD_WIDTH = width / 3.2;

  const flatListRef = useRef<FlatList<CircularProduct>>(null);

  const currentIndex = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CircularProduct>) => (
      <SubscriptionCard
        product={item}
        width={CARD_WIDTH}
        onPress={() => setItemModal(item)}
      />
    ),
    [CARD_WIDTH],
  );

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offset = event.nativeEvent.contentOffset.x;

    const index = Math.round(offset / (CARD_WIDTH + SPACING));

    currentIndex.current = index;

    setActiveIndex(Math.floor(index / ITEMS_PER_PAGE));
  };
  const moveToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index: index,
      animated: true,
    });
  };
  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex.current + ITEMS_PER_PAGE;

      if (nextIndex >= products.length) {
        nextIndex = 0;
      }

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      currentIndex.current = nextIndex;
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <>
      <View className="gap-2">
        <Text className="text-lg uppercase tracking-widest text-beland-green-500">
          Producción circular
        </Text>

        <Text className="mb-4 text-2xl font-semibold">
          Productos con historia
        </Text>

        <FlatList
          ref={flatListRef}
          data={products}
          horizontal
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + SPACING}
          snapToAlignment="start"
          disableIntervalMomentum
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={{
            paddingVertical: 6,
            paddingHorizontal: SPACING,
            gap: SPACING,
          }}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + SPACING,
            offset: (CARD_WIDTH + SPACING) * index,
            index,
          })}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews
        />

        <View className="mt-4 flex-row justify-center">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Pressable
              onPress={() => moveToIndex(index)}
              key={index}
              className={`mx-1 h-2 rounded-full ${
                activeIndex === index
                  ? "w-6 bg-beland-green-500"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>
      </View>
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
            {" "}
            <Image
              source={{ uri: itemModal?.image }}
              className="w-full h-[200px] "
              width={width}
              resizeMode="contain"
            />
            <Text className="italic text-lg font-semibold text-neutral-500">
              Hecho por {itemModal?.madeBy}
            </Text>
            <Text>Suscripción ${itemModal?.price} usd/mes</Text>
            {itemModal?.features.map((feat) => (
              <Text className="text-white font-semibold text-2xl bg-beland-orange-200 my-2 rounded-xl w-[30%] px-2">
                {feat}
              </Text>
            ))}
          </View>
        }
        actions={
          <View>
            <Button title="Suscribirse" onPress={() => {}} />
          </View>
        }
      />
    </>
  );
};

export default SubscriptionSlider;
