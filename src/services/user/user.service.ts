import { CoreApiService } from "@/services/core/ApiService";

const core = new CoreApiService();

export type UpdateUserPayload = {
  full_name: string;
  address?: string;
  phone?: string;
  profile_picture_url?: string;
};

export const userService = {
  updateUser: async (payload: UpdateUserPayload) => {
    const res = await core.patch(`/users/me`, payload);
    return res;
  },
  deleteAddressUser: async (id:string) => {
    const res = await apiRequest(
      `${process.env.EXPO_PUBLIC_API_URL}/user-address/${id}`,
      {
        method: "DELETE",
      }
    );
    return res
  },
};
