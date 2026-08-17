import { useQuery } from "@tanstack/react-query";
import { kalodataService } from "../services/kalodata.service";
import type {
  KalodataCreatorRankRequest,
  KalodataRegion,
  KalodataDateRange,
} from "../services/kalodata.types";

// ─── useKalodataCreators ──────────────────────────────────────────────────────
export function useKalodataCreators(
  params: KalodataCreatorRankRequest,
  enabled = true
) {
  return useQuery({
    queryKey: ["kalodata-creators", params],
    queryFn: () => kalodataService.getCreatorRanking(params),
    enabled,
    staleTime: 5 * 60 * 1000,  // cache 5 phút
    retry: 2,
  });
}

// Re-export types for consumers
export type { KalodataRegion, KalodataDateRange };
