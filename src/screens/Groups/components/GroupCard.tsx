import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Group, GroupPrivacy, PaymentType } from "@/services/GroupApiService";

interface GroupCardProps {
  group: Group;
  variant: "my-group" | "explore";
  onPress: () => void;
  onActionPress?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean; // For "Joined" or "Private" states
  privacyOptions: GroupPrivacy[];
  membersCount?: number;
  paymentType?: PaymentType;
  isMember?: boolean;
  isOwner?: boolean;
  compact?: boolean;
}

export const getGroupTypeIcon = (type: any) => {
  if (!type) return { name: "tag", color: "#5e8d76" };
  const t =
    typeof type === "string" ? type.toLowerCase() : type.name.toLowerCase();

  if (t.includes("cumple")) return { name: "gift", color: "#eab308" };
  if (t.includes("gradu")) return { name: "award", color: "#6366f1" };
  if (t.includes("aniversa")) return { name: "heart", color: "#f43f5e" };
  if (t.includes("amig")) return { name: "users", color: "#5e8d76" };
  if (t.includes("famil")) return { name: "home", color: "#f59e42" };
  if (t.includes("temat")) return { name: "star", color: "#fbbf24" };
  if (t.includes("picnic")) return { name: "sun", color: "#fbbf24" };
  if (t.includes("asado")) return { name: "coffee", color: "#a16207" };
  if (t.includes("año nuevo")) return { name: "calendar", color: "#0ea5e9" };
  if (t.includes("romant")) return { name: "heart", color: "#f43f5e" };
  if (t.includes("bienven")) return { name: "smile", color: "#22d3ee" };
  if (t.includes("desped")) return { name: "flag", color: "#f87171" };
  if (t.includes("infant")) return { name: "smile", color: "#fbbf24" };
  if (t.includes("deport")) return { name: "activity", color: "#22c55e" };
  if (t.includes("trabajo")) return { name: "briefcase", color: "#6366f1" };
  return { name: "tag", color: "#5e8d76" };
};

const getPrivacyIcon = (privacyCode: string) => {
  if (privacyCode === "public") return "globe";
  return "lock";
};

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  variant,
  onPress,
  onActionPress,
  actionLabel,
  actionDisabled,
  privacyOptions,
  membersCount = 0,
  paymentType,
  isMember,
  isOwner,
  compact = false,
}) => {
  const groupPrivacy = privacyOptions.find((p) => p.id === group.privacy_id);
  const isPublic = groupPrivacy?.allow_free_join === true;
  const typeIcon = getGroupTypeIcon(group.group_type);

  const paymentLabel = React.useMemo(() => {
    if (!paymentType) return "Sin especificar";
    switch (paymentType.code) {
      case "EQUAL_SPLIT":
        return "Dividida";
      case "SPLIT":
        return "Por Consumo";
      case "FULL":
        return "Completo";
      default:
        return paymentType.code;
    }
  }, [paymentType]);

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row items-center bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-100"
      >
        {/* Compact Image (Left) */}
        <View className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden relative mr-3 shrink-0">
          {group.image_url ? (
            <Image
              source={{ uri: group.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-50">
              <Feather
                name={typeIcon.name}
                size={20}
                color={typeIcon.color}
                style={{ opacity: 0.7 }}
              />
            </View>
          )}
        </View>

        {/* Compact Content (Right) */}
        <View className="flex-1 min-w-0 justify-center gap-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base font-bold text-gray-800 truncate flex-1 mr-2"
              numberOfLines={1}
            >
              {group.name}
            </Text>
          </View>

          <View className="flex-row items-center flex-wrap gap-2">
            {/* Type Badge */}
            <View className="flex-row items-center bg-gray-50 px-1.5 py-0.5 rounded-md">
              <Text
                className="text-[10px] text-gray-500 font-medium truncate max-w-[80px]"
                numberOfLines={1}
              >
                {typeof group.group_type === "string"
                  ? group.group_type
                  : group.group_type?.name || "Grupo"}
              </Text>
            </View>

            {/* Privacy Badge */}
            <View className="flex-row items-center bg-gray-50 px-1.5 py-0.5 rounded-md">
              <Feather
                name={getPrivacyIcon(groupPrivacy?.code || "")}
                size={8}
                color="#6B7280"
                className="mr-1"
              />
              <Text className="text-[10px] text-gray-500 font-medium capitalize">
                {groupPrivacy?.name || "Privado"}
              </Text>
            </View>

            <Text className="text-[10px] text-gray-400">•</Text>
            <Text className="text-[10px] text-gray-500">
              {membersCount} miembro
            </Text>
          </View>
        </View>

        {/* Compact Action (Far Right) */}
        {variant === "explore" && (
          <View className="ml-2">
            <TouchableOpacity
              onPress={onActionPress}
              disabled={actionDisabled}
              className={`px-3 py-1.5 rounded-full flex-row items-center justify-center shadow-sm ${
                actionDisabled ? "bg-gray-100" : "bg-primary"
              }`}
            >
              {actionDisabled && isMember ? (
                <View className="flex-row items-center">
                  <Feather
                    name="check"
                    size={12}
                    color="#9CA3AF"
                    className="mr-1"
                  />
                  <Text className="text-gray-400 font-medium text-xs">
                    Unido
                  </Text>
                </View>
              ) : actionDisabled ? (
                <View className="flex-row items-center">
                  <Feather name="lock" size={12} color="#9CA3AF" />
                </View>
              ) : (
                <Text className="text-white font-bold text-xs">Unirse</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Image Header */}
      <View className="h-32 w-full bg-gray-100 relative">
        {group.image_url ? (
          <Image
            source={{ uri: group.image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-50">
            <Feather
              name={typeIcon.name}
              size={48}
              color={typeIcon.color}
              style={{ opacity: 0.5 }}
            />
          </View>
        )}

        {/* Status Badge (Active/Inactive) - Only for My Groups */}
        {variant === "my-group" && (
          <View className="absolute top-3 right-3 flex-row items-center bg-white/90 px-2 py-1 rounded-full shadow-sm">
            <View
              className={`w-2 h-2 rounded-full mr-1.5 ${group.is_active ? "bg-green-500" : "bg-gray-400"}`}
            />
            <Text className="text-[10px] font-bold text-gray-700 uppercase">
              {group.is_active ? "Activo" : "Inactivo"}
            </Text>
          </View>
        )}

        {/* Role Badge - Only for My Groups */}
        {variant === "my-group" && isOwner && (
          <View className="absolute top-3 left-3 bg-primary px-2 py-1 rounded-md shadow-sm">
            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
              Líder
            </Text>
          </View>
        )}
      </View>

      {/* Content Body */}
      <View className="p-4">
        {/* Title & Privacy Row */}
        <View className="flex-row justify-between items-start mb-1">
          <Text
            className="text-lg font-bold text-gray-800 flex-1 mr-2"
            numberOfLines={1}
          >
            {group.name}
          </Text>
          <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
            <Feather
              name={getPrivacyIcon(groupPrivacy?.code || "")}
              size={12}
              color="#6B7280"
            />
            <Text className="text-xs text-gray-500 ml-1 font-medium capitalize">
              {groupPrivacy?.name || "Privado"}
            </Text>
          </View>
        </View>

        {/* Metadata Row */}
        <View className="flex-row items-center gap-3 mt-2">
          {/* Type */}
          <View className="flex-row items-center">
            <Feather name="tag" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1.5 font-medium">
              {typeof group.group_type === "string"
                ? group.group_type
                : group.group_type?.name || "Grupo"}
            </Text>
          </View>

          <View className="w-1 h-1 bg-gray-300 rounded-full" />

          {/* Members */}
          <View className="flex-row items-center">
            <Feather name="users" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1.5 font-medium">
              {membersCount} Miembros
            </Text>
          </View>

          <View className="w-1 h-1 bg-gray-300 rounded-full" />

          {/* Payment */}
          <View className="flex-row items-center">
            <Feather name="credit-card" size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1.5 font-medium">
              {paymentLabel}
            </Text>
          </View>
        </View>

        {/* Action Button (Only for Explore) */}
        {variant === "explore" && (
          <TouchableOpacity
            onPress={onActionPress}
            disabled={actionDisabled}
            className={`mt-4 w-full py-2.5 rounded-xl flex-row items-center justify-center ${
              actionDisabled
                ? "bg-gray-100"
                : "bg-primary shadow-sm active:bg-primary/90"
            }`}
          >
            {actionDisabled && isMember ? (
              <Text className="text-gray-500 font-bold text-sm">
                Ya eres miembro
              </Text>
            ) : actionDisabled ? (
              <View className="flex-row items-center">
                <Feather
                  name="lock"
                  size={14}
                  color="#9CA3AF"
                  className="mr-2"
                />
                <Text className="text-gray-500 font-bold text-sm">Privado</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-sm">
                Unirse al Grupo
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
