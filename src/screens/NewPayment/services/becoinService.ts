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
  acquireFreeProduct: async (productId: string, user: User) => { 
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
  }
};
