import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
const { persist, createJSONStorage } = require("zustand/middleware");

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
  price_dollar: string;
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
  is_consumed: boolean;
  is_refunded: boolean;
}
type EventStore = {
  // --- Estados ---
  availableEvents: Event[];
  acquiredEvents: Event[];
  pendingEvents: Event[];
  // --- Acciones ---
  setAvailableEvents: (list: Event[]) => void;
  setAcquiredEvents: (list: Event[]) => void;
  setPendingEvents: (list: Event[]) => void;
  clearEvents: () => void;

  // --- Utils ---
  getEvent: (id: string) => Event | undefined;
  getAcquiredEvent: (id: string) => Event | undefined;
  updateEvent: (event: Event) => void;
};

export const eventStore = create<EventStore>()(
  persist(
    (set: any, get: any) => ({
      availableEvents: [],
      acquiredEvents: [],
      pendingEvents: [],
      setAvailableEvents: (list: Event[]) => set({ availableEvents: list }),
      setAcquiredEvents: (list: Event[]) => set({ acquiredEvents: list }),
      setPendingEvents: (list: Event[]) => set({ pendingEvents: list }),
      clearEvents: () => set({ availableEvents: [], acquiredEvents: [] }),

      getEvent: (id: string) => {
        const all = [...get().availableEvents, ...get().acquiredEvents];
        return all.find((event) => event.id === id);
      },
      getAcquiredEvent: (user_pass_id: string) =>
        get().acquiredEvents.find(
          (event: Event) => event.user_pass_id === user_pass_id
        ),
      updateEvent: (updatedEvent: Event) => {
        set((state: any) => ({
          availableEvents: state.availableEvents.map((event: Event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
          acquiredEvents: state.acquiredEvents.map((event: Event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
        }));
      },
    }),
    {
      name: "events-storage",
      storage: createJSONStorage(() =>
        Platform.OS === "web" ? localStorage : AsyncStorage
      ),
    }
  )
);
