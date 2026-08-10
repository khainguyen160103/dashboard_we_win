import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RolePayload } from "../../model/Role";
import roleService from "../../services/role.service";
import { queryKeys } from "./queryKeys";

type RoleListParams = { page?: number; limit?: number; q?: string };

export const useRolesQuery = (params?: RoleListParams) =>
  useQuery({
    queryKey: queryKeys.roles.list(params),
    queryFn: () => roleService.list(params),
  });

export const useRoleQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => roleService.get(id),
    enabled,
  });

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RolePayload) => roleService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RolePayload> }) =>
      roleService.update(id, payload),
    onSuccess: (updatedRole) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.setQueryData(queryKeys.roles.detail(updatedRole.id), updatedRole);
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.roles.detail(id) });
    },
  });
};
