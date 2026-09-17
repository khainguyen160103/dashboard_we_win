import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { localStorageUtils } from "../utils/localStorageUtils";
import { keyStore } from "../enums/keyStore";
import authService from "../services/auth.service";

import { authStore } from "../store/authStore";



const BASE_URL = import.meta.env.VITE_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
export const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const { setAuth } = authStore.getState();
// ── Request: gắn access token ──────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorageUtils.getItem(keyStore.ACCESS_TOKEN);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorageUtils.getItem(keyStore.REFRESH_TOKEN);
        const response = await refreshApi.post("/auth/refresh", {
          refreshToken,
        });

        localStorage.setItem("access_token", response?.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        api(originalRequest);

        const me = await authService.getMe();
        console.log("Response", me);

        setAuth({ user: me.data });
      } catch (error) {
        localStorageUtils.removeItem(keyStore.ACCESS_TOKEN);
        localStorageUtils.removeItem(keyStore.REFRESH_TOKEN);
        api(originalRequest);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

const axiosClient = api;
export default axiosClient;
