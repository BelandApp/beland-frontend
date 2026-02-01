import { CircleX } from "lucide-react-native";
import { Pressable, View, StyleSheet, TextInput } from "react-native";
interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}
export const SearchBarInput: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder,
}) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#9CA3AF"
      />
      <Pressable style={{}} onPress={() => onSearchChange("")}>
        <CircleX color="#9CA3AF" size={24} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
  },
});

export default SearchBarInput;
