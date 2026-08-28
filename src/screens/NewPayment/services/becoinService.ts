import { User } from "src/context";
import { CoreApiService } from "src/services/core/ApiService";

const core = new CoreApiService();

export const becoinService = {
  acquireProduct: async (eventDto: {
    holder_name: string;
    holder_phone: string;
    holder_instagram_tiktok: string;
    holder_email: string;
    event_pass_id: string;
  }) => {
    const {
      holder_email,
      holder_instagram_tiktok,
      holder_name,
      holder_phone,
      event_pass_id,
    } = eventDto;
    const data = await core.post("user-event-passes/purchase", {
      holder_email,
      holder_instagram_tiktok,
      holder_name,
      holder_phone,
      event_pass_id,
    });
    return data;
  },
};
