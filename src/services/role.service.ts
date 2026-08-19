import { api as axiosClient } from "../api/request";
import type { Role, RolePayload } from "../model/Role";

export const roleService = {
  list: async (params?: { page?: number; limit?: number; q?: string }): Promise<Role[]> => {
    const { data } = await axiosClient.get<any>('/roles', { params });
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

  get: async (id: string): Promise<Role> => {
    const { data } = await axiosClient.get<any>(`/roles/${id}`);
    return data?.data ?? data;
  },

  create: async (payload: RolePayload): Promise<Role> => {
    const { data } = await axiosClient.post<any>('/roles', payload);
    return data?.data ?? data;
  },

  update: async (id: string, payload: Partial<RolePayload>): Promise<Role> => {
    const { data } = await axiosClient.put<any>(`/roles/${id}`, payload);
    return data?.data ?? data;
  },

  assignPermissions: async (entries: { roleId: string; permissionId: string }[]): Promise<void> => {
    await axiosClient.post('/role/permission', entries);
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/roles/${id}`);
  },
};

export default roleService;
