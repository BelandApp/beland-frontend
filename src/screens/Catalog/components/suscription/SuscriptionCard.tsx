import { Image, Pressable, Text, View } from "react-native";
import { CircularProduct } from "./type";
import { memo } from "react";
import { Check, CircleCheck, LeafyGreen } from "lucide-react-native";

interface SubscriptionCardProps {
  product: CircularProduct;
  width: number;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  product,
  width,
}) => {
  const { image, name, price, madeBy, isCircular } = product;
  return (
    <Pressable
      style={{ width }}
      className="overflow-hidden rounded-3xl bg-white h-fit relative shadow"
    >
      {/* Imagen */}
      <View className="py-4 bg-slate-100">
        <Image
          source={{ uri: image }}
          className="w-full h-[200px] "
          width={width}
          resizeMode="contain"
        />
      </View>

      {/* Available Badge */}
      <View className="absolute top-3 right-3 rounded-full bg-white p-1">
        <CircleCheck color="white" fill="green" size={25} />
      </View>
      {/* Badge */}
      <View className="absolute top-3 left-3 bg-white shadow-sm rounded-full py-1 px-3">
        <Text className="text-beland-green-500 flex flex-row gap-2">
          <LeafyGreen size={15} />
          {isCircular ? "Circular" : "Friendly"}
        </Text>
      </View>

      {/* Footer */}
      <View className="w-full p-6">
        <Text className="text-neutral-600 uppercase">{madeBy}</Text>
        <Text className="text-lg font-semibold">{name}</Text>
        <View className="flex flex-row gap-2 items-center">
          <Text className="text-beland-orange-500 text-lg italic">
            ${price}
          </Text>
          <Text>usd/mes</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default memo(SubscriptionCard);
