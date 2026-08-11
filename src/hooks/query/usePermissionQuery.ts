import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PermissionPayload } from "../../model/Permission";
import permissionService from "../../services/permission.service";
import { queryKeys } from "./queryKeys";

type PermissionListParams = { page?: number; limit?: number; q?: string };

export const usePermissionsQuery = (params?: PermissionListParams) =>
  useQuery({
    queryKey: queryKeys.permissions.list(params),
    queryFn: () => permissionService.list(params),
    staleTime: 1000 * 60 * 30, // 30 minutes cache in memory
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection time
  });

export const usePermissionQuery = (id: string | number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.permissions.detail(Number(id) || 0),
    queryFn: () => permissionService.get(id),
    enabled,
  });

export const useCreatePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PermissionPayload) => permissionService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
    },
  });
};

export const useUpdatePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<PermissionPayload> }) =>
      permissionService.update(id, payload),
    onSuccess: (updatedPermission) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
      if (updatedPermission?.id) {
        queryClient.setQueryData(
          queryKeys.permissions.detail(Number(updatedPermission.id) || 0),
          updatedPermission,
        );
      }
    },
  });
};

export const useDeletePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => permissionService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.permissions.detail(Number(id) || 0) });
    },
  });
};
