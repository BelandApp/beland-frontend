import { useEffect, useState, useMemo, useCallback } from "react";
import { eventsService } from "src/services/events";
import { useAuth } from "src/context";
import { Event, useEventStore } from "src/stores/Event";

export const useEvents = () => {
  const { isAuthenticated, user } = useAuth();
  const { events, setEvents } = useEventStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const allEvents = await eventsService.getAllEvents();
      if (isAuthenticated) {
        const userEventsResponse = await eventsService.getUserEvents();
        console.log("Data raw:", userEventsResponse);
        const userEvents = adaptUserEvents(userEventsResponse);
        console.log("Data procesada", userEvents);
        const combined = mergeEvents(allEvents, userEvents);
        setEvents(combined);
      } else {
        setEvents(allEvents);
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

  const availableEvents = useMemo(
    () => events.filter((e: any) => e.is_active && !e.user_acquired),
    [events]
  );

  const acquiredEvents = useMemo(
    () => events.filter((e: any) => e.user_acquired && !e.user_attended),
    [events]
  );

  return {
    availableEvents,
    acquiredEvents,
    refreshing,
    onRefresh,
    isLoading,
  };
};
// NORMALIZAR PROVISORIAMENTE EVENTOS USER RECIBIDOS DEL BACK
const adaptUserEvents = (data: any[]): Event[] => {
  console.log("Procesando Raw:", data);
  return data.map((item) => ({
    ...item.event_pass, // base del evento
    user_acquired: true,
    event_pass_id: item.event_pass_id,
    user_pass_id:item.id,
    user_attended: item.is_consumed ?? false,
    holder_name: item.holder_name,
    holder_email: item.holder_email,
    holder_phone: item.holder_phone,
    holder_instagram_tiktok: item.holder_instagram_tiktok,
    purchase_date: item.purchase_date,
    is_consumed: item.is_consumed,
    is_refunded: item.is_refunded,
  }));
};
// UNIR LOS EVENTOS DEL USUARIO CON LOS GENERALES
const mergeEvents = (all: Event[], userEvents: Event[]): Event[] => {
  const map = new Map(all.map((e) => [e.id, { ...e }]));

  // Si el usuario compró un evento, reemplazamos su info con la del userEvent
  userEvents.forEach((ue) => {
    map.set(ue.id, { ...map.get(ue.id), ...ue });
  });

  return Array.from(map.values());
};
