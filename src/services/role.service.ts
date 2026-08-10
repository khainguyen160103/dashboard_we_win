import { api as axiosClient } from "../api/request";
import type { Role, RolePayload } from "../model/Role";

export const roleService = {
  list: async (params?: { page?: number; limit?: number; q?: string }): Promise<Role[]> => {
    const { data } = await axiosClient.get<Role[]>('/api/roles', { params });
    return data;
  },

  get: async (id: number): Promise<Role> => {
    const { data } = await axiosClient.get<Role>(`/api/roles/${id}`);
    return data;
  },

  create: async (payload: RolePayload): Promise<Role> => {
    const { data } = await axiosClient.post<Role>('/api/roles', payload);
    return data;
  },

  update: async (id: number, payload: Partial<RolePayload>): Promise<Role> => {
    const { data } = await axiosClient.put<Role>(`/api/roles/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await axiosClient.delete(`/api/roles/${id}`);
  },
};

export default roleService;
