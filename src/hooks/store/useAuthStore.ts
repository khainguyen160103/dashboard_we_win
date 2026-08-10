import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../../model/User";

export type State = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
};

export type Action = {
  setAuth: (payload: {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
  }) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
};

const initState: State = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  hasHydrated: false,
};

export const useAuthStore = create<State & Action>()(
  persist(
    (set) => ({
      ...initState,
      setAuth: ({ user, accessToken, refreshToken }) => {
        console.log("user: ", user);
        return set({ user, accessToken, refreshToken, isAuthenticated: true })
      },
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    }),
    {
      name: "auth-storage",
      partialize: (state) =>
      ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      } as unknown as State & Action),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Alias & helpers for backward compatibility
export const useAuth = useAuthStore;
export const selectIsAuthenticated = (state: State) =>
  state.isAuthenticated || Boolean(state.accessToken);

