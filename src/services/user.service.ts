import { api as axiosClient } from "../api/request";
import type { User } from "../model/User";

import type { ApiResponse, ApiResponsePage } from "../model/request";


export const userService = {
  list: async (params?: { page?: number; limit?: number; q?: string }): Promise<User[]> => {
    const response = await axiosClient.get<ApiResponsePage<User>>("/users", {
      params,
    });
    return response.data.data;
  },

  get: async (id: string): Promise<User> => {
    const response = await axiosClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  create: async (payload: Partial<User>): Promise<User> => {
    const response = await axiosClient.post<ApiResponse<User>>(
      "/users",
      payload,
    );
    return response.data.data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const response = await axiosClient.patch<ApiResponse<User>>(
      `/users/${id}`,
      payload,
    );
    return response.data.data;
  },

  updateStatus: async (id: string, payload: Partial<User>): Promise<User> => {
    const response = await axiosClient.patch<ApiResponse<User>>(
      `/users/${id}/status`,
      payload,
    );
    return response.data.data;
  },

  assignRoles: async (id: string, roleIds: string[]): Promise<User> => {
    const response = await axiosClient.put<ApiResponse<User>>(
      `/users/${id}/roles`,
      { roleIds },
    );
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },
};

export default userService;
