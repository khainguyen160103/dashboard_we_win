import axios from "axios";
import { localStorageUtils } from "../utils/localStorageUtils";
import { keyStore } from "../enums/keyStore";
export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorageUtils.getItem(keyStore.ACCESS_TOKEN);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const axiosClient = api;

export default axiosClient;
