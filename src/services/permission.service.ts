import { api as axiosClient } from "../api/request";
import type { Permission, PermissionPayload } from "../model/Permission";

export const permissionService = {
  list: async (params?: { page?: number; limit?: number; q?: string }): Promise<Permission[]> => {
    const { data } = await axiosClient.get<any>('/permissions', { params });
    // Support unwrapping Spring Page / ApiResponse wrapper
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

  get: async (id: string | number): Promise<Permission> => {
    const { data } = await axiosClient.get<any>(`/permissions/${id}`);
    return data?.data ?? data;
  },

  create: async (payload: PermissionPayload): Promise<Permission> => {
    const { data } = await axiosClient.post<any>('/permissions', payload);
    return data?.data ?? data;
  },

  update: async (id: string | number, payload: Partial<PermissionPayload>): Promise<Permission> => {
    const { data } = await axiosClient.put<any>(`/permissions/${id}`, payload);
    return data?.data ?? data;
  },

  remove: async (id: string | number): Promise<void> => {
    await axiosClient.delete(`/permissions/${id}`);
  },
};

export default permissionService;
