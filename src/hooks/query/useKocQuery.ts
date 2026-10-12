import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import kocService from "../../feature/koc/service/koc.service";
import type { KocListParams, KocRequest } from "../../feature/koc/model/Koc";
import { queryKeys } from "./queryKeys";

// export const
export const useKoc = (
  params?: KocListParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: queryKeys.kocs.list(params),
    queryFn: () => kocService.list(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled,
  });

/** Như `useKoc` nhưng trả kèm metadata phân trang (`PageResponse`). */
export const useKocPageQuery = (params?: KocListParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [...queryKeys.kocs.list(params), "page"] as const,
    queryFn: () => kocService.page(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled,
  });

export const useKocQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.kocs.detail(id),
    queryFn: () => kocService.get(id),
    enabled: Boolean(id) && enabled,
  });

export const useCreateKocMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: KocRequest) => kocService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.kocs.lists() });
    },
  });
};

export const useUpdateKocMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<KocRequest> }) =>
      kocService.update(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.kocs.lists() });
      if (updated?.id) {
        queryClient.setQueryData(queryKeys.kocs.detail(String(updated.id)), updated);
      }
    },
  });
};

export const useDeleteKocMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kocService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.kocs.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.kocs.detail(id) });
    },
  });
};

/**
 * Hook gộp tiện dùng trong component (giống `useUsers`).
 */
export const useKocs = (params?: KocListParams) => {
  const query = useKoc(params);
  const createMutation = useCreateKocMutation();
  const updateMutation = useUpdateKocMutation();
  const deleteMutation = useDeleteKocMutation();

  return {
    ...query,
    kocs: query.data ?? [],
    createKoc: createMutation.mutateAsync,
    updateKoc: updateMutation.mutateAsync,
    deleteKoc: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
