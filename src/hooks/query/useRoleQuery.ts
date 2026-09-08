import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RolePayload } from "../../model/Role";
import roleService from "../../services/role.service";
import { queryKeys } from "./queryKeys";

type RoleListParams = { page?: number; limit?: number; q?: string };
  
export const roleQuery = {
  getRoles: (params?: RoleListParams) =>
    useQuery({
      queryKey: queryKeys.roles.list(params),
      queryFn: () => roleService.list(params),
      staleTime: 1000 * 60 * 30, // 30 minutes cache in memory
      gcTime: 1000 * 60 * 60, // 1 hour garbage collection time
    }),

  getRole: (id: string, enabled = true) =>
    useQuery({
      queryKey: queryKeys.roles.detail(Number(id) || 0),
      queryFn: () => roleService.get(id),
      enabled,
    }),

  create: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (payload: RolePayload) => roleService.create(payload),
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.roles.lists(),
        });
      },
    });
  },

  update: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: Partial<RolePayload>;
      }) => roleService.update(id, payload),
      onSuccess: (updatedRole) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.roles.lists(),
        });
        if (updatedRole?.id) {
          queryClient.setQueryData(
            queryKeys.roles.detail(Number(updatedRole.id) || 0),
            updatedRole,
          );
        }
      },
    });
  },

  delete: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => roleService.remove(id),
      onSuccess: (_data, id) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.roles.lists(),
        });
      },
    });
  },

  assignPermissions: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (entries: { roleId: string; permissionId: string }[]) =>
        roleService.assignPermissions(entries),
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.roles.lists(),
        });
      },
    });
  },
};
