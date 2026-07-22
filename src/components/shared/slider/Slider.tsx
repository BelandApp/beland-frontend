import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import { Product } from "src/types";
interface SliderProps {
  data: any;
  renderItem: any;
  CARD_WIDTH: number;
  SPACING: number;
  ITEMS_PER_PAGE: number;
}
export const Slider: React.FC<SliderProps> = ({
  data,
  renderItem,
  CARD_WIDTH,
  SPACING,
  ITEMS_PER_PAGE,
}) => {
  const flatListRef = useRef<FlatList<Product>>(null);
  const currentIndex = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const AUTO_SCROLL_INTERVAL = 4000;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
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
    if (data.length <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex.current + ITEMS_PER_PAGE;

      if (nextIndex >= data.length) {
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
  }, [data.length]);
  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        decelerationRate="normal"
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
  );
};

export default Slider;
