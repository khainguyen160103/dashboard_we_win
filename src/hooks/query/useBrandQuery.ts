import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import brandService from "../../services/brand.service";
import type { BrandListParams, BrandRequest } from "../../model/Brand";
import { queryKeys } from "./queryKeys";

/** Danh sách brand từ REST API (`GET /brands`), cache 5 phút. */
export const useBrandsQuery = (params?: BrandListParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.brands.list(params),
    queryFn: () => brandService.list(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled,
  });

export const useBrandQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.brands.detail(id),
    queryFn: () => brandService.get(id),
    enabled: Boolean(id) && enabled,
  });

export const useCreateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BrandRequest) => brandService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
  });
};

export const useUpdateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<BrandRequest> }) =>
      brandService.update(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
      if (updated?.id != null) {
        queryClient.setQueryData(queryKeys.brands.detail(String(updated.id)), updated);
      }
    },
  });
};

export const useDeleteBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => brandService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.brands.detail(String(id)) });
    },
  });
};

/** Hook gộp tiện dùng trong component. */
export const useBrands = (params?: BrandListParams) => {
  const query = useBrandsQuery(params);
  const createMutation = useCreateBrandMutation();
  const updateMutation = useUpdateBrandMutation();
  const deleteMutation = useDeleteBrandMutation();

  return {
    ...query,
    brands: query.data ?? [],
    createBrand: createMutation.mutateAsync,
    updateBrand: updateMutation.mutateAsync,
    deleteBrand: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
