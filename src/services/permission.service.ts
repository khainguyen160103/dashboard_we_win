import { api as axiosClient } from "../api/request";
import type { Permission, PermissionPayload } from "../model/Permission";

export const permissionService = {
  list: async (params?: { page?: number; limit?: number; q?: string }): Promise<Permission[]> => {
    const { data } = await axiosClient.get<Permission[]>('/api/permissions', { params });
    return data;
  },

  get: async (id: number): Promise<Permission> => {
    const { data } = await axiosClient.get<Permission>(`/api/permissions/${id}`);
    return data;
  },

  create: async (payload: PermissionPayload): Promise<Permission> => {
    const { data } = await axiosClient.post<Permission>('/api/permissions', payload);
    return data;
  },

  update: async (id: number, payload: Partial<PermissionPayload>): Promise<Permission> => {
    const { data } = await axiosClient.put<Permission>(`/api/permissions/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await axiosClient.delete(`/api/permissions/${id}`);
  },
};

export default permissionService;
