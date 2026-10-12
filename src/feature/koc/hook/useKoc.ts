import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import kocService from "@/feature/koc/service/koc.service";
import type { KocListParams, KocRequest } from "@/feature/koc/model/Koc";
import { kocKeys } from "./kocKeys";

type QueryOptions = { enabled?: boolean };

const STALE_TIME = 1000 * 60 * 5;

// ─── Queries ──────────────────────────────────────────────────────────────────

/** `GET /kocs` -> danh sách KOC. */
const useList = (params?: KocListParams, options?: QueryOptions) =>
  useQuery({
    queryKey: kocKeys.list(params),
    queryFn: () => kocService.list(params),
    staleTime: STALE_TIME,
    enabled: options?.enabled,
  });

/** Như `list` nhưng kèm metadata phân trang (`PageResponse`). */
const usePage = (params?: KocListParams, options?: QueryOptions) =>
  useQuery({
    queryKey: kocKeys.page(params),
    queryFn: () => kocService.page(params),
    staleTime: STALE_TIME,
    enabled: options?.enabled,
    // Giữ trang cũ trên màn hình trong lúc tải trang mới -> bảng không nháy trống.
    placeholderData: keepPreviousData,
  });

/** `GET /kocs/{id}` -> 1 KOC. */
const useDetail = (id: string, options?: QueryOptions) =>
  useQuery({
    queryKey: kocKeys.detail(id),
    queryFn: () => kocService.get(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/** `POST /kocs`. */
const useCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: KocRequest) => kocService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: kocKeys.lists() });
    },
  });
};

/** `PUT /kocs/{id}`. */
const useUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<KocRequest> }) =>
      kocService.update(id, payload),
    onSuccess: (updated, { id }) => {
      void queryClient.invalidateQueries({ queryKey: kocKeys.lists() });
      queryClient.setQueryData(kocKeys.detail(id), updated);
    },
  });
};

/** `DELETE /kocs/{id}`. */
const useRemove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kocService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: kocKeys.lists() });
      queryClient.removeQueries({ queryKey: kocKeys.detail(id) });
    },
  });
};

export const useKoc = {
  list: useList,
  page: usePage,
  detail: useDetail,
  create: useCreate,
  update: useUpdate,
  remove: useRemove,
};

export default useKoc;
