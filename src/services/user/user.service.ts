import { apiRequest } from "../api";

export type UpdateUserPayload = {
  full_name: string;
  address?: string;
  phone?: string;
  profile_picture_url?: string;
};

export const userService = {
  updateUser: async (payload: UpdateUserPayload) => {
    const res = await apiRequest(
      `${process.env.EXPO_PUBLIC_API_URL}/users/me`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return res
  },
};
