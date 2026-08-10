import { api } from "./request";
import type { LoginParams, LoginResponse } from "./auth-types";

export const loginRequest = (params: LoginParams) =>
  api.post<LoginResponse>(
    "/api/auth/login",
    {
      username: params.username,
      password: params.password,
    },
    { withCredentials: true },
  );

export const logoutRequest = () =>
  api.post("/api/auth/logout", {}, { withCredentials: true });

export const refreshRequest = () =>
  api.post<LoginResponse>("/api/auth/refresh", {}, { withCredentials: true });
