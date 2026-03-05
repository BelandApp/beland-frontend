import { storage } from "src/stores";

const DEEPLINK_KEY = "pending_deeplink";

export const DeepLinkService = {
  async setSendIntent(id: string) {
    await storage.setItem(
      DEEPLINK_KEY,
      JSON.stringify({
        screen: "SendScreen",
        params: { id },
      }),
    );
  },

  async getIntent() {
    const data = await storage.getItem(DEEPLINK_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearIntent() {
    await storage.removeItem(DEEPLINK_KEY);
  },
};
