import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { GroupMember } from "src/services/groups/GroupApiService";
import { CustomLoader } from "@/components/shared/loader/Loader";

interface GroupMembersListProps {
  members: GroupMember[];
  currentUserId?: string;
  onMemberOptions?: (member: GroupMember) => void;
  loading?: boolean;
}

const GroupMembersList: React.FC<GroupMembersListProps> = ({
  members,
  currentUserId,
  onMemberOptions,
  loading = false,
}) => {
  const renderMember = ({ item }: { item: GroupMember }) => {
    const isLeader = item.role === "LEADER";
    const isYou =
      currentUserId &&
      (item.user?.id === currentUserId || item.user_id === currentUserId);
    // Fecha de unión: usar joined_at o, si no existe, created_at del registro de miembro
    let fechaUnion = "";
    const rawDate = item.joined_at || item.created_at;
    if (rawDate) {
      try {
        const date = new Date(rawDate);
        if (!isNaN(date.getTime())) {
          fechaUnion = date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      } catch (error) {
        console.error("Error parsing date:", rawDate, error);
      }
    }
    // Preferir: user.full_name, user.email, user_id
    const displayName =
      item.user?.full_name || item.user?.email || item.user_id;
    // Preferir: user.profile_picture_url, placeholder
    const avatarUrl =
      item.user?.profile_picture_url || "https://placehold.co/48x48";
    return (
      <View
        className={`flex-row items-center bg-white rounded-2xl mb-3 p-3 ${
          isYou ? "border-2 border-primary/60" : ""
        }`}
      >
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#e5e7eb",
          }}
        />
        <View className="flex-1 ml-3 min-w-0">
          <Text className="font-bold text-base truncate text-text-main-light">
            {displayName} {isYou ? "(Tú)" : ""}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-text-sec-light font-medium">
              {isLeader ? "Líder" : "Miembro"}
            </Text>
          </View>
          <Text className="text-xs text-text-sec-light mt-1">
            {fechaUnion && `Se unió el ${fechaUnion}`}
          </Text>
        </View>
        {isLeader && (
          <View className="ml-2 bg-primary/10 rounded-full px-2 py-1 flex-row items-center">
            <Text className="text-xs font-bold text-primary">Líder</Text>
            <Feather
              name="shield"
              size={16}
              color="#00e074"
              style={{ marginLeft: 4 }}
            />
          </View>
        )}
        {!isLeader && onMemberOptions && (
          <TouchableOpacity
            onPress={() => onMemberOptions(item)}
            className="ml-2 p-2"
          >
            <Feather name="more-vertical" size={22} color="#5e8d76" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.id}
      renderItem={renderMember}
      contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }}
      refreshing={loading}
      ListEmptyComponent={
        loading ? (
          <View style={{ paddingTop: 24 }}>
            <CustomLoader />
          </View>
        ) : (
          <Text className="text-center text-text-sec-light mt-10">
            No se encontraron miembros
          </Text>
        )
      }
    />
  );
};

export default GroupMembersList;
