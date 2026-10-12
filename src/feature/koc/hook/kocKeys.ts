import type { KocListParams } from "@/feature/koc/model/Koc";

/** Query key của feature KOC — cùng gốc `["kocs"]` với `queryKeys.kocs` nên invalidate chéo vẫn đúng. */
export const kocKeys = {
  all: ["kocs"] as const,
  lists: () => [...kocKeys.all, "list"] as const,
  list: (params?: KocListParams) => [...kocKeys.lists(), params ?? {}] as const,
  page: (params?: KocListParams) => [...kocKeys.list(params), "page"] as const,
  details: () => [...kocKeys.all, "detail"] as const,
  detail: (id: string) => [...kocKeys.details(), id] as const,
};
