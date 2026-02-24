import { FlatList, View, Text, Linking } from "react-native";
import { BeCoinIcon, Button, ThemedHeader } from "src/components";
import { FAQreturn, useFAQs } from "./hooks/useFAQs";
const openWhatsapp = () => {
  const url = "https://wa.me/+593995269974";

  Linking.openURL(url).catch((err) =>
    console.error("Error opening WhatsApp", err),
  );
};
const FAQScreen: React.FC = () => {
  const { data } = useFAQs();
  return (
    <>
      <ThemedHeader title="Preguntas Frecuentes" canGoBack />
      <FlatList
        renderItem={renderItem}
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-2"
        className="p-4"
      />
    </>
  );
};
const renderItem = ({ item }: { item: FAQreturn }) => (
  <View className="flex flex-col bg-[#FFFFFF] rounded-lg mt-1 p-2 gap-1">
    <View className="flex flex-row items-center gap-2">
      <Text className="text-orange-500 text-lg font-semibold">{item.id}</Text>
      <Text className="font-bold italic text-lg">{item.question}</Text>
    </View>
    <View className="flex md:flex-row items-center gap-2">
      <Text className="pl-6">{item.answer}</Text>
      {item.link && (
        <Button
          accessibilityRole="link"
          title="Whatsapp"
          onPress={openWhatsapp}
          variant="inline"
          className="w-fit mx-0"
        />
      )}
    </View>
    {item.list && (
      <View className="px-8">
        {item.list.map((article) => (
          <Text>• {article}</Text>
        ))}
      </View>
    )}
    {item.subAnswer &&
      item.subAnswer.map((sub) => (
        <View className="px-6 mt-1 gap-1">
          <View className="flex flex-row items-center gap-1">
            <BeCoinIcon color={sub.icon} />
            <Text className="text-lg font-bold italic">{sub.title}</Text>
          </View>
          <Text className=" px-2">{sub.message}</Text>
          {sub.list &&
            sub.list.map((article) => (
              <Text className="capitalize px-2">{article}</Text>
            ))}
        </View>
      ))}
    {item.messageBeland && (
      <View className="flex flex-row gap-1 line-clamp-1">
        <Text className="text-beland-orange-500 font-semibold text-end">
          👉 Mensaje Beland:
        </Text>
        <Text>{item.messageBeland}</Text>
      </View>
    )}
  </View>
);
export default FAQScreen;
