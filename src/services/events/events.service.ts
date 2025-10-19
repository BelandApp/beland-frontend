import Constants from "expo-constants";
import { Event } from "src/stores/Event";
const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

export const eventsService = {
  getEvents: async () => {
    const response = await fetch(`${API_URL}/event-pass?is_active=true`);
    const data = await response.json();
    return data;
  },
  getEvent: async (eventId: string) => {
    const response = await fetch(`${API_URL}/event-pass/${eventId}`);
    const data = await response.json();
    return data;
  },
  createEvent: async (newEvent: Event) => {
    const response = await fetch(`${API_URL}/event-pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    const data = await response.json();
    return data;
  },
  updateEvent: async (eventId: string, updatedEvent: Event) => {
    const response = await fetch(`${API_URL}/event-pass/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    });
    const data = await response.json();
    return data;
  },
  deleteEvent: async (eventId: string) => {
    const response = await fetch(`${API_URL}/event-pass/${eventId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  },

};
