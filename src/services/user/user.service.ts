import { useFetchWithAuth } from "src/hooks/fetch/useFetchWithAuth";

export type UpdateUserPayload = {
  full_name: string;
  address?: string;
  phone?: string;
  profile_picture_url?: string;
};

export const userService = {
  updateUser: async (payload: UpdateUserPayload) => {
    const fetchWithAuth = useFetchWithAuth();
    const res = await fetchWithAuth(
      `${process.env.EXPO_PUBLIC_API_URL}/users/me`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error(`Error ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },

  fetchProfile: async () => {
    const fetchWithAuth = useFetchWithAuth();
    const res = await fetchWithAuth(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/me`
    );
    if (!res.ok) throw new Error("No se pudo obtener el perfil");
    return await res.json();
  },
};
