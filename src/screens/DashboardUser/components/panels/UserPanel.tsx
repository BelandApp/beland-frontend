import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "src/context";
import { useBeCoinsStore } from "src/stores/useBeCoinsStore";
import DashboardWrapper from "../DashboardWrapper";
import { useUserProfileForm } from "src/hooks/user/useUserProfileForm";
import ProfileImagePicker from "../imagePicker/ProfileImagePicker";
import UserProfileFields from "../fields/UserProfileFields";
import UserStats from "../stats/UserStats";
import {styles} from "../../styles/styles"

export const UserPanel: React.FC = () => {
  const { user, isLoading, setUser } = useAuth();
  const form = useUserProfileForm(user, setUser);
  const globalBeCoinsBalance = useBeCoinsStore((s) => s.balance);

  if (!user) {
    return (
      <DashboardWrapper title="Dashboard" isLoading={isLoading}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No se pudieron cargar los datos del usuario. Por favor, reinicie la
            aplicación.
          </Text>
        </View>
      </DashboardWrapper>
    );
  }

  const parsedUserBalance =
    Number((user as any)?.current_balance ?? (user as any)?.coins ?? 0) || 0;
  const storeBalanceNum = Number(globalBeCoinsBalance ?? 0) || 0;
  const beCoinsToShow =
    storeBalanceNum > 0 ? storeBalanceNum : parsedUserBalance;

  return (
    <DashboardWrapper title="Dashboard" isLoading={isLoading}>
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.iconEdit}
            onPress={() => form.setEditing((s) => !s)}
          >
            <Text style={styles.iconEditText}>{form.editing ? "✖" : "✎"}</Text>
          </TouchableOpacity>

          <ProfileImagePicker
            localImage={form.localImage}
            userPicture={user.profile_picture_url}
            editing={form.editing}
            pickImage={form.pickImage}
          />

          <Text style={styles.profileName}>
            {user.full_name || user.email.split("@")[0]}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profileSubtitle}>Mi perfil</Text>

          <UserProfileFields {...form} styles={styles} />

          <View style={styles.actionsRow}>
            {form.editing && (
              <>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={form.onCancel}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={()=>form.onSave()}
                  disabled={form.saving}
                >
                  {form.saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Guardar cambios</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <UserStats
          beCoinsBalance={beCoinsToShow}
          currentLevel={1}
          styles={styles}
        />
      </View>
    </DashboardWrapper>
  );
};
