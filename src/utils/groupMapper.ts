import { Group as UiGroup } from "../types/Group";

type ApiGroup = any;

export function mapApiGroupToUi(api: ApiGroup): UiGroup {
  return {
    id: api.id,
    name: api.name,
    leader_id: api.leader?.id || api.leader_id || "",
    location: api.location ?? null,
    location_url: api.location_url ?? null,
    date_time: api.date_time ? new Date(api.date_time) : null,
    status: mapStatus(api.status),
    created_at: api.created_at ? new Date(api.created_at) : new Date(),
    updated_at: api.updated_at ? new Date(api.updated_at) : new Date(),
    deleted_at: api.deleted_at ?? null,
  };
}

function mapStatus(apiStatus: string | undefined): UiGroup["status"] {
  if (!apiStatus) return "inactive";
  const s = apiStatus.toString().toUpperCase();
  switch (s) {
    case "ACTIVE":
      return "active";
    case "PENDING":
      return "pending";
    case "INACTIVE":
      return "inactive";
    case "DELETE":
      return "delete";
    default:
      // backend might use completed for history
      if (s === "COMPLETED") return "completed";
      return "inactive";
  }
}
