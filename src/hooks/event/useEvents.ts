import { useEffect, useState, useMemo, useCallback } from "react";
import { eventsService } from "src/services/events";
import { useAuth } from "src/context";
import { eventStore, Event } from "@/stores";
import { useCache } from "../cache/useCache";

export const useEvents = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    setAvailableEvents,
    setAcquiredEvents,
    setPendingEvents,
    availableEvents,
    acquiredEvents,
  } = eventStore();
  const {
    data,
    refresh,
    loading: isLoading,
  } = useCache({
    key: "events_cache",
    duration: 6 * 60 * 60 * 1000,
    fetcher: () => eventsService.getAllEvents(),
  });

  const normalizeEvents = (raw: any): Event[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as Event[];
    if (raw.data && Array.isArray(raw.data)) return raw.data as Event[];
    return [];
  };

  const setEvents = async () => {
    try {
      const availableRaw = normalizeEvents(data);
      if (isAuthenticated) {
        const userEventsResponse = await eventsService.getUserEvents();
        const userEvents = adaptUserEvents(userEventsResponse || []);
        const uniqueAvailable = removeDuplicatesById(availableRaw);
        setAvailableEvents(uniqueAvailable);
        setAcquiredEvents(userEvents);
        const pending = userEvents.filter((e) => {
          const isFuture = new Date(e.event_date) >= new Date();
          const isUnused = !e.is_consumed;
          return isFuture && isUnused;
        });
        setPendingEvents(pending);
      } else {
        setAvailableEvents(removeDuplicatesById(availableRaw));
        setAcquiredEvents([]);
      }
    } catch (err) {
      // Avoid uncaught promise rejections; log and keep state safe
      // eslint-disable-next-line no-console
      console.error("useEvents setEvents error:", err);
      setAvailableEvents([]);
      setAcquiredEvents([]);
    }
  };

  useEffect(() => {
    setEvents();
  }, [isAuthenticated, user, data]);

  return { availableEvents, acquiredEvents, refresh, isLoading };
};

// --- Helpers ---
const adaptUserEvents = (data: any[]): Event[] => {
  return data.map((item) => ({
    ...item.event_pass,
    user_acquired: true,
    event_pass_id: item.event_pass_id,
    user_pass_id: item.id,
    user_attended: item.is_consumed ?? false,
    holder_name: item.holder_name,
    holder_email: item.holder_email,
    holder_phone: item.holder_phone,
    holder_instagram_tiktok: item.holder_instagram_tiktok,
    purchase_date: item.purchase_date,
    is_consumed: item.is_consumed,
    is_refunded: item.is_refunded,
    purchase_price: item.purchase_price,
    longitude: item.longitude,
    latitude: item.latitude,
  }));
};

const removeDuplicatesById = (events: any): Event[] => {
  const arr: Event[] = Array.isArray(events) ? events : [];
  const seen = new Set();
  return arr.filter((e) => {
    const id = e?.id ?? e?.event_pass_id ?? e?.user_pass_id;
    if (id == null) return false;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};
