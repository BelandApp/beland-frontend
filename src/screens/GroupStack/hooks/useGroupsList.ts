import { useMemo, useState } from "react";
import { useCache } from "src/hooks/cache/useCache";
import { Group, GroupService } from "src/services";

export const useGroupList = () => {
  const { data, loading, refresh, clear, error } = useCache({
    key: "Grupos",
    duration: 100,
    fetcher: () => GroupService.getMyGroups().then((res) => res),
  });

  const sortEvents = (events: Group[]) => {
    const now = new Date();

    const upcoming = events
      .filter((g) => new Date(g.event_at) >= now)
      .sort(
        (a, b) =>
          new Date(a.event_at).getTime() - new Date(b.event_at).getTime(),
      );

    const past = events
      .filter((g) => new Date(g.event_at) < now)
      .sort(
        (a, b) =>
          new Date(b.event_at).getTime() - new Date(a.event_at).getTime(),
      );

    return [...upcoming, ...past];
  };

  const filters = {
    Todos: () => true,
    Pendientes: (g: Group) => new Date(g.event_at) > new Date(),
    Finalizados: (g: Group) => new Date(g.event_at) <= new Date(),
  };

  return { data, loading, refresh, clear, error, sortEvents, filters };
};
