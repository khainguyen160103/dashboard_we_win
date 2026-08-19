import { api as axiosClient } from "../api/request";
import type { User } from "../model/User";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
};

export type PageData<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export const userService = {
  list: async (params?: { page?: number; limit?: number; q?: string }): Promise<User[]> => {
    const { data } = await axiosClient.get<any>('/users', { params });

    if (Array.isArray(data)) {
      return data;
    }
    if (data?.data?.content && Array.isArray(data.data.content)) {
      return data.data.content;
    }
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  get: async (id: string): Promise<User> => {
    const { data } = await axiosClient.get<any>(`/users/${id}`);
    return data?.data ?? data;
  },

  create: async (payload: Partial<User>): Promise<User> => {
    const { data } = await axiosClient.post<any>('/users', payload);
    return data?.data ?? data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await axiosClient.patch<any>(`/users/${id}`, payload);
    return data?.data ?? data;
  },

  updateStatus: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await axiosClient.patch<any>(`/users/${id}/status`, payload);
    return data?.data ?? data;
  },

  assignRoles: async (id: string, roleIds: string[]): Promise<User> => {
    const { data } = await axiosClient.put<any>(`/users/${id}/roles`, { roleIds });
    return data?.data ?? data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },
};

export default userService;
