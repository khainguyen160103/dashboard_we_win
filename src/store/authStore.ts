import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../model/User";
import  {keyStore} from "../enums/keyStore";

type AuthStore = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
  }) => void;
  clearAuth: () => void;
  setIsAuthenticated: (value: boolean) => void;
  hasRole : (role : string[]) => boolean, 
  hasPermission :(permission: string[]) => boolean,
  can: (resource : string, action: string) => boolean | undefined
};

const initState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export const authStore = create<AuthStore>()(
  persist(
    (set,get) => ({
      ...initState,
      setAuth: ({ user, accessToken, refreshToken }) => {
        console.log("user: ", user);
        return set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      can : (resource: string, action:string) =>  { 
        return get().user?.permissions?.includes(`${resource}:${action}`)
      }, 
      hasRole: (role: string[]) => { 
        const {user} = get();
        return role.some((r) => user?.roles?.includes(r))
      }
      , 
      hasPermission : (permission: string[]) => { 
        const {user} = get(); 
        return permission.some( p => user?.permissions?.includes(p))
      }
    }),
  
    {
      name: keyStore.Auth,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);


