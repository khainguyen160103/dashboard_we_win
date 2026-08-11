import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "../model/User";
import userService from "../services/user.service";
import { queryKeys } from "./query/queryKeys";

type UserListParams = { page?: number; limit?: number; q?: string };

export const useUsersQuery = (params?: UserListParams) =>
  useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.list(params),
  });

export const useUserQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.get(id),
    enabled,
  });

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<User>) => userService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      userService.update(id, payload),
    onSuccess: (updatedUser) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.id), updatedUser);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
};

/**
 * Combined custom hook `useUsers` for convenience
 */
export const useUsers = (params?: UserListParams) => {
  const query = useUsersQuery(params);
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  return {
    ...query,
    users: query.data ?? [],
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

