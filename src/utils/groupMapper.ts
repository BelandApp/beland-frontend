import { Group as UiGroup } from "../types/Group";

type ApiGroup = any;

export function mapApiGroupToUi(api: ApiGroup): UiGroup {
  return {
    id: api.id,
    name: api.name,
    leader_id: api.leader?.id || api.leader_id || api.user_id || "",
    location: api.location ?? null,
    is_active: api.is_active,
    location_url: api.location_url ?? null,
    date_time: api.date_time ? new Date(api.date_time) : null,
    status: mapStatus(api.status),
    created_at: api.created_at ? new Date(api.created_at) : new Date(),
    updated_at: api.updated_at ? new Date(api.updated_at) : new Date(),
    deleted_at: api.deleted_at ?? null,
    group_type:
      api.group_type?.name ||
      (typeof api.group_type === "string" ? api.group_type : null),
    privacy:
      typeof api.privacy === "string" ? api.privacy : api.privacy?.name || null,
    image_url: api.image_url || null,
    members_count: Array.isArray(api.members)
      ? api.members.length
      : api.members_count ?? null,
    is_leader: !!(api.leader_id
      ? api.leader_id === (api.current_user_id || api.user_id)
      : api.is_leader),
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
