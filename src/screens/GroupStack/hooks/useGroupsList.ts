import { useCache } from "src/hooks/cache/useCache";
import { GroupService } from "src/services";

export const useGroupList = () => {
  const { data, loading, refresh, clear, error } = useCache({
    key: "Grupos",
    duration: 100,
    fetcher: () => GroupService.getMyGroups().then((res) => res),
  });
  return { data, loading, refresh, clear, error };
};
