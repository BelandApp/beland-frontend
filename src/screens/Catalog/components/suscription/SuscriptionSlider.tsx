import { Image, Text, View } from "react-native";
import { Button } from "src/components";

export interface SubscriptionProduct {
  name: string;
  id: string;
  imageUrl: string;
  price: number;
  characters: string[];
}
interface SubscriptionProps {
  products: SubscriptionProduct[];
}
const SubscriptionSlider: React.FC<SubscriptionProps> = ({ products }) => {
  return (
    <View className="flex items-center">
      {products.map((product) => (
        <View className="flex flex-col rounded-xl bg-beland-green-500 p-6 gap-10 min-w-[90%] md:min-w-[700px] shadow relative">
          <View className="flex flex-row">
            <View className="z-10">
              <Text className="text-3xl text-white font-semibold">
                {product.name}
              </Text>
              <Text className="font-semibold italic text-neutral-200 text-xl">
                ${product.price} usd/month
              </Text>
              <View className="mt-5">
                {product.characters.map((item) => (
                  <Text className="text-lg text-rose-100 font-medium">
                    {item}
                  </Text>
                ))}
              </View>
            </View>
            <Image
              source={require("../../../../../assets/Eggs-default.png")}
              resizeMode="contain"
              className="absolute top-0 md:-top-8 right-0 md:right-0 max-w-[150px] max-h-[150px] md:max-w-[250px] md:max-h-[250px]"
            />
          </View>
          <Button title="Suscribirse" onPress={() => {}} />
        </View>
      ))}
    </View>
  );
};

export default SubscriptionSlider;
