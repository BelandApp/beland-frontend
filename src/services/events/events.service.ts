import Constants from "expo-constants";
import { Event } from "src/stores/Event";
import { apiRequest } from "../api";
const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

export const eventsService = {
  getAllEvents: async () => {
    const response = await apiRequest("/event-pass?is_active=true");
    return response.data;
  },
  getUserEvents: async () => {
    const response = await apiRequest(`/user-event-passes/user`);
    return response.data;
  },
  getOneEvent: async (eventId: string) => {
    const response = await apiRequest(`${API_URL}/event-pass/${eventId}`);
    const data = await response.json();
    return data;
  },
  createEvent: async (newEvent: Event) => {
    const response = await apiRequest(`${API_URL}/event-pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    const data = await response.json();
    return data;
  },
  updateEvent: async (eventId: string, updatedEvent: Event) => {
    const response = await apiRequest(`${API_URL}/event-pass/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    });
    const data = await response.json();
    return data;
  },
  deleteEvent: async (eventId: string) => {
    const response = await apiRequest(`${API_URL}/event-pass/${eventId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  },
  consumeQr: async (eventId: string, userEvent_id: string) => {
    const response = await apiRequest(
      `${API_URL}/user-event-passes/consume?user_eventpass_id=${userEvent_id}&eventpass_id=${eventId}`,
      {
        method: "POST",
      }
    );
    console.log(response);
    return response
  },
  refundEvent: async (eventId: string) => {
    const response = await apiRequest(`${API_URL}/user-event-passes/refund/${eventId}`, {
      method: "POST",
    });
    const data = await response.json();
    return data;
  },
};
