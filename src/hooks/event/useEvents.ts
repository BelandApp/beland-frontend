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
        const userEvents = await eventsService.getUserEvents();
        const combined = mergeEvents(allEvents, userEvents);
        setEvents(combined);
      } else {
        setEvents(allEvents);
      }
    } catch (error) {
      console.log("Error fetching events:", error);
    }
    finally {
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
    isLoading
  };
};

const mergeEvents = (all: Event[], userEvents: Event[]) => {
  const userIds = userEvents.map((ue) => ue.id);
  const combined = [
    ...all.map((e) => ({
      ...e,
      user_acquired: userIds.includes(e.id),
      user_attended: userEvents.find((ue) => ue.id === e.id)?.user_attended,
    })),
  ];

  userEvents.forEach((ue) => {
    if (!combined.find((c) => c.id === ue.id)) {
      combined.push({
        ...ue,
        user_acquired: true,
        user_attended: ue.user_attended ?? false,
      });
    }
  });
  return combined;
};
