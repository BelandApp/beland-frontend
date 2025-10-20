import { Storage } from "./storage.service";

const ACCESS_TOKEN_KEY = "access_token";

export const TokenService = {
  async saveToken(token: string) {
    await Storage.setItem(ACCESS_TOKEN_KEY, token);
  },

  async getToken() {
    return await Storage.getItem(ACCESS_TOKEN_KEY);
  },

  async clearToken() {
    await Storage.removeItem(ACCESS_TOKEN_KEY);
  },
};
