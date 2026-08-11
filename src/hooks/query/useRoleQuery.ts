import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role, RolePayload } from "../../model/Role";
import roleService from "../../services/role.service";
import { queryKeys } from "./queryKeys";

type RoleListParams = { page?: number; limit?: number; q?: string };

/**
 * Fetch all roles from REST API (`GET /roles`) with React Query caching in memory.
 * Uses staleTime (30 minutes) to avoid repeated API requests and protect role metadata.
 */
export const useRolesQuery = (params?: RoleListParams) =>
  useQuery({
    queryKey: queryKeys.roles.list(params),
    queryFn: () => roleService.list(params),
    staleTime: 1000 * 60 * 30, // 30 minutes cache in memory
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection time
  });

export const useRoleQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.roles.detail(Number(id) || 0),
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
    mutationFn: ({ id, payload }: { id: string; payload: Partial<RolePayload> }) =>
      roleService.update(id, payload),
    onSuccess: (updatedRole) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      if (updatedRole?.id) {
        queryClient.setQueryData(queryKeys.roles.detail(Number(updatedRole.id) || 0), updatedRole);
      }
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.roles.detail(Number(id) || 0) });
    },
  });
};
