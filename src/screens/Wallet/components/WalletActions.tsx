import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WalletAction } from "../types";
import { actionsStyles } from "../styles";

interface WalletActionsProps {
  actions: WalletAction[];
  backgroundColor?: string;
}

export const WalletActions: React.FC<WalletActionsProps> = ({
  actions,
  backgroundColor,
}) => {
  const handlePress = (action: WalletAction) => {
    if (action.onPress) {
      action.onPress();
    }
  };

  return (
    <>
      <View
        style={[
          actionsStyles.actionsContainer,
          backgroundColor ? { backgroundColor } : {},
        ]}
      >
        {actions.map((action) => {
          const IconComponent = action.icon as
            | React.ComponentType<any>
            | undefined;

          if (!IconComponent) {
            console.warn(
              `WalletActions: icon for action "${action.id}" is undefined`,
            );
          }

          return (
            <TouchableOpacity
              key={action.id}
              style={actionsStyles.actionButton}
              onPress={() => handlePress(action)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  actionsStyles.actionIcon,
                  { backgroundColor: action.bgColor || "#E5E7EB" },
                ]}
              >
                {IconComponent ? (
                  <IconComponent
                    width={24}
                    height={24}
                    color={action.color || "#374151"}
                  />
                ) : (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: "#EEE",
                      borderRadius: 6,
                    }}
                  />
                )}
              </View>
              <Text style={actionsStyles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};
