import { User } from "src/context";
import { apiRequest } from "src/services";

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
    const data = await apiRequest("User-event-passes/purchase", {
      method: "POST",
      body: JSON.stringify({
        holder_email,
        holder_instagram_tiktok,
        holder_name,
        holder_phone,
        event_pass_id,
      }),
    });
    return data;
  },
};
