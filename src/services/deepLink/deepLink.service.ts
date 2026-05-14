import { storage } from "src/stores";

const DEEPLINK_KEY = "pending_deeplink";
export type SetIntentType = {
  screen: string;
  id: string | undefined;
  amount: string | undefined;
};
export const DeepLinkService = {
  async setIntent({ screen, id, amount }: SetIntentType) {
    await storage.setItem(
      DEEPLINK_KEY,
      JSON.stringify({
        screen,
        params: { id, amount },
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
