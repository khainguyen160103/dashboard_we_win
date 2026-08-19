import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { authStore } from "../store/authStore";
import type { loginRequest } from "../model/User";
import { message } from "antd";
import { keyStore } from "../enums/keyStore";
import { localStorageUtils } from "../utils/localStorageUtils";
import { useNavigate } from "react-router";

export const useAuth = () => {
  const setAuth = authStore((state) => state.setAuth);
  const clearAuth = authStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const useLogin = useMutation({
    mutationFn: async (params: loginRequest) => await authService.login(params),
    onSuccess: (data) => {
      if (data?.data) {
        setAuth({
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
        });
        navigate("/");
        message.success(`${data.message}`);
      }
    },
    onError: (error) => {
      console.log("error: ", error);
      message.error(`${error.message}`);
    },
  });
  const useLogout = useMutation({
    mutationFn: async () => {
      const refreshToken = authStore.getState().refreshToken;
      if (!refreshToken) {
        message.error("Refresh token is missing");
        return false;
      }
      return await authService.logout(refreshToken);
    },
    onSuccess: () => {
      message.success("Đăng xuất thành công!");
      navigate("/signin");
      clearAuth();
      localStorageUtils.removeItem(keyStore.Auth);
    },

    onError: (error) => {
      console.log("error: ", error);
      message.error(`${error.message}`);
    },
  });

  return {
    useLogin,
    useLogout,
  };
};
