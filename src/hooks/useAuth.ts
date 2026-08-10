import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "./store/useAuthStore";
import type { loginRequest } from "../model/User";

/**
 * Fetch current user profile (/auth/me) with React Query
 */
export const useMeQuery = (options?: { enabled?: boolean }) => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const response = await authService.getMe();
            if (response?.data) {
                setAuth({
                    user: response.data,
                    accessToken: useAuthStore.getState().accessToken,
                    refreshToken: useAuthStore.getState().refreshToken,
                });
            }
            return response.data;
        },
        enabled: options?.enabled ?? isAuthenticated,
        retry: false,
    });
};

/**
 * Login mutation with React Query
 */
export const useLoginMutation = () => {

    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: (params: loginRequest) => authService.login(params),
        onSuccess: (response) => {
            if (response?.data) {
                const loginData = response.data;
                setAuth({
                    user: loginData.user ?? null,
                    accessToken: loginData.accessToken ?? null,
                    refreshToken: loginData.refreshToken ?? null,
                });
            }
        },
    });
};

/**
 * Logout mutation with React Query
 */
export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
        },
        onError: () => {
            clearAuth();
            queryClient.clear();
        },
    });
};

/**
 * Comprehensive React Query + Zustand Authentication Hook
 */
export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const accessToken = useAuthStore((state) => state.accessToken);
    const refreshToken = useAuthStore((state) => state.refreshToken);

    const loginMutation = useLoginMutation();
    const logoutMutation = useLogoutMutation();
    const meQuery = useMeQuery();

    return {
        // Auth State
        user,
        isAuthenticated,
        accessToken,
        refreshToken,
        isAdmin: Boolean(user?.isAdmin),

        // React Query /me
        me: meQuery.data,
        isLoadingMe: meQuery.isLoading,
        isFetchingMe: meQuery.isFetching,
        refetchMe: meQuery.refetch,

        // Login Action
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,

        // Logout Action
        logout: logoutMutation.mutate,
        logoutAsync: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isPending,
        logoutError: logoutMutation.error,
    };
}

export default useAuth;
