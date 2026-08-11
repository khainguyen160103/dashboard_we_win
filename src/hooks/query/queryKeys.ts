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
  campaigns: {
    all: ["campaigns"] as const,
    lists: () => [...queryKeys.campaigns.all, "list"] as const,
    list: (params?: { page?: number; limit?: number; q?: string; status?: string }) =>
      [...queryKeys.campaigns.lists(), params ?? {}] as const,
    details: () => [...queryKeys.campaigns.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.campaigns.details(), id] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    lists: () => [...queryKeys.jobs.all, "list"] as const,
    list: (params?: { videoStatus?: string; invitationStatus?: string }) =>
      [...queryKeys.jobs.lists(), params ?? {}] as const,
    myJobs: () => [...queryKeys.jobs.all, "myJobs"] as const,
    details: () => [...queryKeys.jobs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },
} as const;
