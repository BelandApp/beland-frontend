import { FlatList, View, Text } from "react-native";
import { ThemedHeader } from "src/components";
import { FAQreturn, useFAQs } from "./hooks/useFAQs";

const FAQScreen: React.FC = () => {
  const { data } = useFAQs();
  return (
    <>
      <ThemedHeader title="Preguntas Frecuentes" canGoBack />
      <View className="flex flex-col gap-2 p-4">
        <FlatList
          renderItem={renderItem}
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2"
        />
      </View>
    </>
  );
};
const renderItem = ({ item }: { item: FAQreturn }) => (
  <View className="flex flex-col bg-slate-500 rounded-lg ">
    <View className="flex flex-row items-center gap-2">
      <Text className="text-orange-500 text-lg font-semibold">{item.id}</Text>
      <Text className="font-bold italic">{item.question}</Text>
    </View>

    <Text className="px-6">{item.answer}</Text>
    {item.list && (
      <View className="px-8">
        {item.list.map((article) => (
          <Text>• {article}</Text>
        ))}
      </View>
    )}
    {item.messageBeland && <Text>👉 Mensaje Beland: {item.messageBeland}</Text>}
  </View>
);
export default FAQScreen;
