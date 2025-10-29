import { User } from "src/context";
import { apiRequest } from "src/services";

export const becoinService = {
  buyEventPass: async (amount: number, productId: string, user: User) => {
    const res = await apiRequest("User-event-passes/purchase", {
      method: "POST",
      body: JSON.stringify({
        event_pass_id: productId,
        holder_name: user.full_name,
        holder_phone: "",
        holder_document: "",
      }),
    });
    const data = await res.json();
    return data;
  },
  acquireFreeProduct: async (eventDto: {
    holder_name: string;
    holder_phone: number;
    holder_instagram_tiktok: string;
    holder_email: string;
    event_pass_id: string;
  }) => {
    const {holder_email,holder_instagram_tiktok,holder_name,holder_phone, event_pass_id} = eventDto;
    const res = await apiRequest("User-event-passes/purchase", {
      method: "POST",
      body: JSON.stringify({
        holder_email,
        holder_instagram_tiktok,
        holder_name,
        holder_phone,
        event_pass_id,
      }),
    });
    const data = await res.json();
    return data;
  },
};
