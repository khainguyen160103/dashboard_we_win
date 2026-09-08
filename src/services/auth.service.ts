import { api as axiosClient } from "../api/request";
import { URL } from "../api/url";
import type { Response } from "../model/Response";
import type { User, loginRequest, loginResponse } from "../model/User";

/**
 * Điểm truy cập DUY NHẤT cho API xác thực (login / logout / refresh / me).
 * Không tạo lớp gọi auth song song ở nơi khác — dùng `authService` ở đây.
 */
export const authService = {
  login: async (params: loginRequest): Promise<Response<loginResponse>> => {
    const { data } = await axiosClient.post<Response<loginResponse>>(
      URL.AUTH.LOGIN,
      { email: params.email, password: params.password },
      { withCredentials: true },
    );
    return data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await axiosClient.post(
      URL.AUTH.LOGOUT,
      { refreshToken },
      { withCredentials: true },
    );
  },

  /** Cấp lại access token. Trả về token mới (BE có thể xoay cả refresh token). */
  refresh: async (): Promise<Response<loginResponse>> => {
    const { data } = await axiosClient.post<Response<loginResponse>>(
      URL.AUTH.REFRESH,
      {},
      { withCredentials: true },
    );
    return data;
  },

  getMe: async (): Promise<Response<User>> => {
    const { data } = await axiosClient.get<Response<User>>(URL.AUTH.ME, {
      withCredentials: true,
    });
    return data;
  },
};

export default authService;
