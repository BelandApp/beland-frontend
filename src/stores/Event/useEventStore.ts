import { create } from "zustand";
const { persist, createJSONStorage } = require("zustand/middleware");
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type BasicEvent ={
  id: string;
  name: string;
  image_url: string;
  images_urls: string[];
  code: string;
  description: string;
  event_place: string;
  event_city: string;
  event_date: Date | string;
  start_sale_date: Date | string;
  end_sale_date: Date | string;
  limit_tickets: number;
  price_becoin: string;
  discount: string;
  total_becoin: string;
  is_active: boolean;
  created_by: string;
  is_refundable: boolean;
  refund_days_limit: number | null;
  qr: string;
  sold_tickets: number;
  available: true;
  attended_count: number;
  created_at: Date;
  updated_at: Date;
};
export interface Event extends BasicEvent {
  // Info del holder (solo si fue adquirido)
  user_acquired?: boolean;
  user_attended?: boolean;
  holder_name?: string;
  holder_email?: string;
  holder_phone?: string;
  holder_instagram_tiktok?: string;
  purchase_date?: string;
  event_pass_id?: string;
  user_pass_id?: string;
  purchase_price?: string;
  longitude?: string;
  latitude?: string;
}
type EventStore = {
  events: Event[];
  setEvents: (list: Event[]) => void;
  getEvent: (id: string) => Event | undefined;
  setEvent: (event: Event) => void;
};

export const useEventStore = create<EventStore>()(
  persist(
    (set: any, get: any) => ({
      events: [],
      setEvents: (list: Event[]) => set({ events: list }),
      getEvent: (id: string) => get().events.find((event:Event) => event.id === id),
      setEvent: (updatedEvent: Event) =>
        set((state: any) => ({
          events: state.events.map((event:Event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
        })),
    }),
    {
      name: "events-storage",
      storage: createJSONStorage(() =>
        Platform.OS === "web" ? localStorage : AsyncStorage
      ),
    }
  )
);
