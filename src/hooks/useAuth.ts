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
    onSuccess: async (data) => {
      const { accessToken, refreshToken } = data?.data ?? {};
      if (!accessToken) {
        message.error(data?.message ?? "Đăng nhập thất bại");
        return;
      }

      localStorageUtils.setItem(keyStore.ACCESS_TOKEN, accessToken);
      localStorageUtils.setItem(keyStore.REFRESH_TOKEN, refreshToken);

      try {
        const me = await authService.getMe();
        console.log("me data" , me);
        
        setAuth({ user: me.data });
        message.success(data?.message ?? "Đăng nhập thành công");
        navigate("/dashboard");
      } catch (error: any) {
        localStorageUtils.removeItem(keyStore.ACCESS_TOKEN);
        localStorageUtils.removeItem(keyStore.REFRESH_TOKEN);
        clearAuth();
        message.error(
          error?.response?.data?.message ??
            "Không lấy được thông tin người dùng",
        );
      }
    },
    onError: (error) => {
      console.log("error: ", error);
      message.error(`test${error.message}`);
    },
  });
  const useLogout = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorageUtils.getItem(keyStore.REFRESH_TOKEN);
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
      localStorageUtils.removeItem(keyStore.ACCESS_TOKEN);
      localStorageUtils.removeItem(keyStore.REFRESH_TOKEN);
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
