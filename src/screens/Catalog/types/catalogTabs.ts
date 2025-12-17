export type CatalogTab =
  | { type: "ALL" }
  | { type: "CATEGORY"; categoryName: string }
  | { type: "SORT"; sortBy: "price" | "sold_count"; order: "ASC" | "DESC" };
