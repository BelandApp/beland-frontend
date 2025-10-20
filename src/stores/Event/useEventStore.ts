import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export type Event = {
  id: string;
  name: string;
  image_url: string;
  background_url: string;
  code: string;
  description: string;
  event_date: Date;
  start_date: Date;
  end_date: Date;
  limit_tickets: number;
  price_becoins: number;
  discount: number;
  total_becoin: number;
  is_active: boolean;
  is_refundable: boolean;
  refund_days_limit: number | null;
  // nuevos
  is_user_favorite: boolean;
  // chequear o retirar
};

type EventStore = {
  events: Record<string, Event>;
  setEvents: (list: Event[]) => void;
  getEvent: (id: string) => Event | undefined;
  setEvent: (event: Event) => void;
};
const mockedEvents: Event[] = [
  {
    id: "1",
    name: "Recital Beland",
    image_url:
      "https://imgs.search.brave.com/lW_9AyMqOq3e87qK0AcT2-736j6sRk5kxwzabWD6Atw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzUxLzIvbWNkb25h/bGRzLWxvZ28tcG5n/X3NlZWtsb2dvLTUx/NDY0Mi5wbmc",
    background_url:
      "https://imgs.search.brave.com/vv77jBSPb7tMK3H_Axgw1c8JI6f9RIf669u3s8Wio1I/rs:fit:500:0:1:0/g:ce/aHR0cDovL2Jsb2cu/bG9nb215d2F5LmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAx/Ny8wMS9tY2RvbmFs/ZHMtbG9nby5qcGc",
    code: "string",
    description: "description",
    event_date: new Date(),
    start_date: new Date(),
    end_date: new Date(),
    limit_tickets: 100,
    price_becoins: 50,
    discount: 20,
    total_becoin: 50,
    is_active: true,
    is_refundable: true,
    refund_days_limit: 7,
    is_user_favorite: false,
  },
  {
    id: "2",
    name: "Recital Belandos",
    image_url: "../../assets/events/mcdonald.png",
    background_url: "string",
    code: "string",
    description: "description",
    event_date: new Date(),
    start_date: new Date(),
    end_date: new Date(),
    limit_tickets: 100,
    price_becoins: 50,
    discount: 20,
    total_becoin: 50,
    is_active: true,
    is_refundable: true,
    refund_days_limit: 7,
    is_user_favorite: false,
  },
];
export const useEventStore = create<EventStore>((set, get) => ({
  events: mockedEvents.reduce((acc, event) => ({ ...acc, [event.id]: event }), {}),
  setEvents: (list: Event[]) =>
    set((state) => ({
      events: {
        ...state.events,
        ...Object.fromEntries(list.map((e) => [e.id, e])),
      },
    })),
  getEvent: (id: string) => get().events[id],
  setEvent: (event: Event) =>
    set({ events: { ...get().events, [event.id]: event } }),
}));