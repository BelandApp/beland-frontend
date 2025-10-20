import React from "react";
import { TouchableOpacity, Image, Platform } from "react-native";

interface Props {
  localImage: string | null;
  userPicture: string | undefined;
  editing: boolean;
  pickImage: () => Promise<void>;
}

const ProfileImagePicker: React.FC<Props> = ({
  localImage,
  userPicture,
  editing,
  pickImage,
}) => (
  <TouchableOpacity onPress={() => (editing ? pickImage() : null)}>
    <Image
      source={{
        uri:
          localImage ||
          userPicture ||
          "https://ui-avatars.com/api/?name=User&background=random",
      }}
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderColor: "#007AFF",
        borderWidth: 2,
      }}
    />
  </TouchableOpacity>
);

export default ProfileImagePicker;
