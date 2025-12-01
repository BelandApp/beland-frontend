import { useEffect, useState, useMemo, useCallback } from "react";
import { eventsService } from "src/services/events";
import { useAuth } from "src/context";
import { eventStore, Event } from "@/stores";

export const useEvents = () => {
  const { isAuthenticated, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    setAvailableEvents,
    setAcquiredEvents,
    availableEvents,
    acquiredEvents,
  } = eventStore();
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const allEvents = await eventsService.getAllEvents();
      if (isAuthenticated) {
        const userEventsResponse = await eventsService.getUserEvents();
        const userEvents = adaptUserEvents(userEventsResponse);
        const uniqueAvailable = removeDuplicatesById(allEvents);
        setAvailableEvents(uniqueAvailable);
        setAcquiredEvents(userEvents);
      } else {
        setAvailableEvents(removeDuplicatesById(allEvents));
        setAcquiredEvents([]);
      }
    } catch (error) {
      console.log("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);


  return { availableEvents, acquiredEvents, refreshing, onRefresh, isLoading };
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
