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
    availableEvents,
    acquiredEvents,
  } = eventStore();
  const { data, refresh, loading: isLoading } = useCache({ key: "events_cache", duration: 6 * 60 * 60 * 1000, fetcher: () => eventsService.getAllEvents() });
  
  const setEvents = async () => {
    if (isAuthenticated) {
      const userEventsResponse = await eventsService.getUserEvents();
      const userEvents = adaptUserEvents(userEventsResponse);
      const uniqueAvailable = removeDuplicatesById(data);
      setAvailableEvents(uniqueAvailable);
    setAcquiredEvents(userEvents);
  } else {
    setAvailableEvents(removeDuplicatesById(data));
    setAcquiredEvents([]);
  }
}

  useEffect(() => {
    setEvents();
  }, [isAuthenticated, user,data]);



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

const removeDuplicatesById = (events: Event[]): Event[] => {
  const seen = new Set();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
};
