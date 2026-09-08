import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "../model/User";
import userService from "../services/user.service";
import { queryKeys } from "./query/queryKeys";

type UserListParams = { page?: number; limit?: number; q?: string };
export const useUser = {
  getUsers: (params?: UserListParams) => {
    return useQuery({
      queryKey: queryKeys.users.list(params),
      queryFn: () => userService.list(params),
    });
  },

  getUser: (id: string, enabled = true) => {
    return useQuery({
      queryKey: queryKeys.users.detail(id),
      queryFn: () => userService.get(id),
      enabled,
    });
  },

  create: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (payload: Partial<User>) => userService.create(payload),
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.users.lists(),
        });
      },
    });
  },
  update: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
        userService.update(id, payload),
      onSuccess: (updatedUser) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.users.lists(),
        });
        queryClient.setQueryData(
          queryKeys.users.detail(updatedUser.id),
          updatedUser,
        );
      },
    });
  },
  updateStatus: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
        userService.updateStatus(id, payload),
      onSuccess: (updatedUser) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.users.lists(),
        });
        queryClient.setQueryData(
          queryKeys.users.detail(updatedUser.id),
          updatedUser,
        );
      },
    });
  },
  delete: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => userService.remove(id),
      onSuccess: (_data, id) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.users.lists(),
        });
        queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      },
    });
  },

  assignRole: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
        userService.assignRoles(id, roleIds),
      onSuccess: (updatedUser) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.users.lists(),
        });
        queryClient.setQueryData(
          queryKeys.users.detail(updatedUser.id),
          updatedUser,
        );
      },
    });
  },
};













