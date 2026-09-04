import { create } from "zustand";
import type { User } from "../model/User";

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (payload: { user: User | null }) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  setIsAuthenticated: (value: boolean) => void;
  hasRole: (role: string[]) => boolean;
  hasPermission: (permission: string[]) => boolean;
  can: (resource: string, action: string) => boolean | undefined;
};

const initState = {
  user: null,
  isAuthenticated: false,
};

export const authStore = create<AuthStore>()((set, get) => ({
  ...initState,
  setAuth: ({ user }) => {
    return set({ user, isAuthenticated: !!user });
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
  setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  can: (resource: string, action: string) => {
    return get().user?.permissions?.includes(`${resource}:${action}`);
  },
  hasRole: (roles: string[]) => {
    const { user } = get();
    if (!user?.roles) return false;
    return roles.some((r) =>
      user.roles?.some((userRole: any) =>
        typeof userRole === "string"
          ? userRole === r
          : userRole?.code === r || userRole?.name === r || userRole?.id === r,
      ),
    );
  },
  hasPermission: (permission: string[]) => {
    const { user } = get();
    return permission.some((p) => user?.permissions?.includes(p));
  },
}));
