export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: { page?: number; limit?: number; q?: string }) =>
      [...queryKeys.users.lists(), params ?? {}] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: (params?: { page?: number; limit?: number; q?: string }) =>
      [...queryKeys.roles.lists(), params ?? {}] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.roles.details(), id] as const,
  },
  permissions: {
    all: ["permissions"] as const,
    lists: () => [...queryKeys.permissions.all, "list"] as const,
    list: (params?: { page?: number; limit?: number; q?: string }) =>
      [...queryKeys.permissions.lists(), params ?? {}] as const,
    details: () => [...queryKeys.permissions.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.permissions.details(), id] as const,
  },
} as const;
