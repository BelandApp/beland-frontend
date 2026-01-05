import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: { label: string; onPress: () => void; destructive?: boolean }[];
  anchorPosition?: { top: number; right: number };
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  visible,
  onClose,
  actions,
  anchorPosition,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.menu,
          anchorPosition
            ? { top: anchorPosition.top, right: anchorPosition.right }
            : {},
        ]}
      >
        {actions.map((action, idx) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.menuItem, action.destructive && styles.destructive]}
            onPress={() => {
              onClose();
              setTimeout(action.onPress, 100);
            }}
          >
            <Text
              style={[
                styles.menuItemText,
                action.destructive && styles.destructiveText,
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  menu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 80 : 60,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#eee",
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  menuItemText: {
    fontSize: 16,
    color: "#222",
  },
  destructive: {
    backgroundColor: "#fff0f0",
  },
  destructiveText: {
    color: "#e53935",
    fontWeight: "bold",
  },
});
