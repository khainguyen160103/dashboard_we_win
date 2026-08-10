import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PermissionPayload } from "../../model/Permission";
import permissionService from "../../services/permission.service";
import { queryKeys } from "./queryKeys";

type PermissionListParams = { page?: number; limit?: number; q?: string };

export const usePermissionsQuery = (params?: PermissionListParams) =>
  useQuery({
    queryKey: queryKeys.permissions.list(params),
    queryFn: () => permissionService.list(params),
  });

export const usePermissionQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.permissions.detail(id),
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
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PermissionPayload> }) =>
      permissionService.update(id, payload),
    onSuccess: (updatedPermission) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
      queryClient.setQueryData(
        queryKeys.permissions.detail(updatedPermission.id),
        updatedPermission,
      );
    },
  });
};

export const useDeletePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => permissionService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.permissions.detail(id) });
    },
  });
};
