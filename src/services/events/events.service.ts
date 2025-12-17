import Constants from "expo-constants";
import { Event } from "src/stores/Event";
import { CoreApiService } from "@/services/core/ApiService";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;
const core = new CoreApiService();

export const eventsService = {
  getAllEvents: async () => {
    const response = await core.get(`/event-pass?is_active=true`);
    return response.data;
  },
  getUserEvents: async () => {
    const response = await core.get(`/user-event-passes/user`);
    return response.data;
  },
  getOneEvent: async (eventId: string) => {
    const response = await core.get(`${API_URL}/event-pass/${eventId}`);
    return response.data;
  },
  createEvent: async (newEvent: Event) => {
    const response = await core.post(`${API_URL}/event-pass`, newEvent);
    return response.data;
  },
  updateEvent: async (eventId: string, updatedEvent: Event) => {
    const response = await core.put(
      `${API_URL}/event-pass/${eventId}`,
      updatedEvent
    );
    return response.data;
  },
  deleteEvent: async (eventId: string) => {
    const response = await core.delete(`${API_URL}/event-pass/${eventId}`);
    return response.data;
  },
  consumeQr: async (eventId: string, userEvent_id: string) => {
    const response = await core.post(
      `${API_URL}/user-event-passes/consume?user_eventpass_id=${userEvent_id}&eventpass_id=${eventId}`
    );
    return response;
  },
  refundEvent: async (eventId: string) => {
    const response = await core.post(
      `${API_URL}/user-event-passes/refund/${eventId}`
    );
    return response.data;
  },
};
