import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { useAuth } from "src/hooks/AuthContext";
import { useBeCoinsStore } from "src/stores/useBeCoinsStore";
import DashboardWrapper from "./DashboardWrapper";

// Para mostrar estadísticas basadas en el usuario
interface UserStats {
  beCoinsBalance: number;
  currentLevel: number;
}

const UserPanel: React.FC = () => {
  const { user, isLoading, fetchWithAuth, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [address, setAddress] = useState((user as any)?.address || "");
  const [phone, setPhone] = useState((user as any)?.phone?.toString() || "");
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Obtener balance global de becoins (persistido) y hacer fallback a campos del user
  const globalBeCoinsBalance = useBeCoinsStore((s) => s.balance);

  const parsedUserBalance =
    Number((user as any)?.current_balance ?? (user as any)?.coins ?? 0) || 0;

  // Asegurarnos de que el balance del store sea un número (puede venir como string)
  const storeBalanceNum = Number(globalBeCoinsBalance ?? 0) || 0;

  const beCoinsToShow =
    storeBalanceNum > 0 ? storeBalanceNum : parsedUserBalance;

  // Construir stats a partir del user
  const userStats: UserStats = {
    beCoinsBalance: beCoinsToShow,
    // Fijamos el nivel en 1 por defecto como pediste
    currentLevel: 1,
  };

  const apiBase =
    Constants.expoConfig?.extra?.apiUrl || "http://localhost:8081";

  const pickImage = async () => {
    try {
      if (Platform.OS === "web") {
        const file: File | null = await new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e: any) => {
            const f = e?.target?.files?.[0] ?? null;
            resolve(f);
          };
          input.click();
        });

        if (file) {
          const url = URL.createObjectURL(file);
          setLocalImage(url);
          setLocalImageFile(file);
        }
        return;
      }

      const ImagePicker = await import("expo-image-picker");
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permisos para acceder a las fotos."
        );
        return;
      }

      // el tipo real puede variar según la versión; casteamos a any para manipular
      const result: any = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      // La API moderna devuelve { canceled: boolean, assets?: [{ uri }] }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setLocalImage(uri);
        setLocalImageFile(null);
      }
    } catch (err) {
      // Error selecting image; show user alert
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const convertImageToDataUrl = async (): Promise<string | null> => {
    try {
      // Web: usamos FileReader sobre localImageFile
      if (Platform.OS === "web" && localImageFile) {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(localImageFile);
        });
      }

      // Native: usamos expo-file-system para leer como base64
      if (localImage) {
        try {
          const FileSystem = await import("expo-file-system");
          const base64 = await FileSystem.readAsStringAsync(localImage, {
            encoding: "base64",
          });
          const filename = localImage.split("/").pop() || "photo.jpg";
          const match = /\.([0-9a-z]+)(?:[?#]|$)/i.exec(filename);
          const ext = match ? match[1] : "jpg";
          const mimeType = ext === "png" ? "image/png" : "image/jpeg";
          return `data:${mimeType};base64,${base64}`;
        } catch (e) {
          console.warn("[UserPanel] Error reading file as base64:", e);
          return null;
        }
      }
    } catch (err) {
      // ignore conversion errors
    }
    return null;
  };

  const onSave = async () => {
    if (!user) return;
    if (fullName.trim().length === 0) {
      Alert.alert("Nombre inválido", "El nombre no puede quedar vacío.");
      return;
    }

    setSaving(true);
    try {
      // payload prepared for PATCH

      let res: Response;

      // Construimos siempre un body JSON. Si hay imagen, la convertimos a data URL y la incluimos
      const jsonBody: any = {
        full_name: fullName,
        address: address ?? "",
        phone: phone ?? "",
      };

      if (localImage || localImageFile) {
        const dataUrl = await convertImageToDataUrl();
        if (dataUrl) {
          jsonBody.profile_picture_url = dataUrl;
        } else {
          console.warn(
            "[UserPanel] No se pudo convertir la imagen a data URL, se enviará el resto de campos sin imagen."
          );
        }
      }

      const bodyString = JSON.stringify(jsonBody);

      res = await fetchWithAuth(`${apiBase}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: bodyString,
      } as RequestInit);

      // Leer el texto de respuesta
      const resText = await res.text();
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      // Intentar parsear JSON de respuesta
      let updated: any = null;
      try {
        updated = resText ? JSON.parse(resText) : null;
      } catch (e) {
        // ignore JSON parse errors
      }

      // Si el PATCH devolvió el usuario actualizado, aplicarlo (confirmación servidor)
      if (updated && (updated as any).full_name) {
        const updatedUser = updated as any;
        // normalizar role y picture
        let rawRoleVal = "";
        if (typeof updatedUser.role === "string") rawRoleVal = updatedUser.role;
        else if (updatedUser.role && typeof updatedUser.role === "object")
          rawRoleVal =
            updatedUser.role.name || updatedUser.role.role_name || "";
        else rawRoleVal = updatedUser.role_name || "";
        const normalizedRole = rawRoleVal
          ? rawRoleVal.toString().toUpperCase()
          : undefined;

        const userObj = {
          ...updatedUser,
          role: normalizedRole,
          picture: updatedUser.profile_picture_url || updatedUser.picture,
        } as any;
        setUser(userObj);
      } else {
        // Si el PATCH no devolvió el usuario actualizado, intentar obtenerlo desde /auth/me.
        try {
          const profileRes = await fetchWithAuth(`${apiBase}/auth/me`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();

            // Normalizar role
            let rawRoleVal = "";
            if (typeof profileData.role === "string") {
              rawRoleVal = profileData.role;
            } else if (
              profileData.role &&
              typeof profileData.role === "object"
            ) {
              rawRoleVal =
                profileData.role.name || profileData.role.role_name || "";
            } else {
              rawRoleVal = profileData.role_name || "";
            }
            const normalizedRole = rawRoleVal
              ? rawRoleVal.toString().toUpperCase()
              : undefined;

            const userObj = {
              ...profileData,
              role: normalizedRole,
              picture: profileData.profile_picture_url || profileData.picture,
            } as any;
            setUser(userObj);
          } else {
            // Si no podemos confirmar en backend, considerarlo fallo: no aplicar cambio localmente
            Alert.alert(
              "Error",
              "No pudimos guardar los cambios en el servidor. Intenta de nuevo."
            );
            // No hacemos fallback local para evitar inconsistencias entre cliente/servidor
            return;
          }
        } catch (err) {
          // error refreshing profile
          Alert.alert(
            "Error",
            "No pudimos confirmar los cambios con el servidor. Intenta de nuevo."
          );
          return;
        }
      }

      Alert.alert(
        "Perfil actualizado",
        "Tus datos se han guardado correctamente."
      );
      setEditing(false);
    } catch (err) {
      Alert.alert(
        "Error",
        "No se pudo actualizar el perfil. Intenta de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    // restaurar valores desde user
    setFullName(user?.full_name || "");
    setAddress((user as any)?.address || "");
    setPhone((user as any)?.phone?.toString() || "");
    setLocalImage(null);
    setEditing(false);
  };

  return (
    <DashboardWrapper
      title={`Bienvenido, ${user?.full_name || user?.email.split("@")[0]}`}
      isLoading={isLoading}
    >
      {user ? (
        <View style={styles.container}>
          <View style={styles.profileCard}>
            {/* Icon edit en la esquina superior derecha */}
            <TouchableOpacity
              style={styles.iconEdit}
              onPress={() => setEditing((s) => !s)}
            >
              <Text style={styles.iconEditText}>{editing ? "✖" : "✎"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => (editing ? pickImage() : null)}>
              <Image
                source={{
                  uri:
                    localImage ||
                    user.picture ||
                    (user as any).profile_picture_url ||
                    "https://ui-avatars.com/api/?name=User&background=random",
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>

            {editing ? (
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholder="Nombre completo"
              />
            ) : (
              <Text style={styles.profileName}>
                {user.full_name || user.email.split("@")[0]}
              </Text>
            )}

            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileSubtitle}>Mi perfil</Text>

            {editing && (
              <View style={{ width: "100%", marginTop: 12 }}>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                  placeholder="Dirección"
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  placeholder="Teléfono"
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View style={styles.actionsRow}>
              {editing ? (
                <>
                  <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={onSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveText}>Guardar cambios</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.beCoinsBalance}</Text>
              <Text style={styles.statLabel}>BeCoins</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.currentLevel}</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No se pudieron cargar los datos del usuario. Por favor, reinicie la
            aplicación.
          </Text>
        </View>
      )}
    </DashboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  input: {
    width: "100%",
    backgroundColor: "#f7f7f8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#007AFF",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    minWidth: 160,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginTop: 8,
  },
  statCard: {
    width: "40%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
  iconEdit: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  iconEditText: {
    color: "#007AFF",
    fontWeight: "700",
    fontSize: 16,
  },
  profileSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#999",
  },
  hintRow: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 6,
  },
  hintText: {
    color: "#666",
    fontSize: 13,
  },
});

export default UserPanel;
