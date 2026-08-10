import { api as axiosClient } from "../api/request";
import type { User } from "../model/User";

export const userService = {
  list: async (params?: { page?: number; limit?: number; q?: string }): Promise<User[]> => {
    const { data } = await axiosClient.get<User[]>('/api/users', { params });
    return data;
  },

  get: async (id: string): Promise<User> => {
    const { data } = await axiosClient.get<User>(`/api/users/${id}`);
    return data;
  },

  create: async (payload: Partial<User>): Promise<User> => {
    const { data } = await axiosClient.post<User>('/api/users', payload);
    return data;
  },

  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await axiosClient.put<User>(`/api/users/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/users/${id}`);
  },
};

export default userService;
