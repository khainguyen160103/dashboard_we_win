import { api as axiosClient } from "../api/request";
import { ApiResponse } from "../model/request";
import type { Role, RolePayload } from "../model/Role";

export const roleService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<Role[]> => {
    const response = await axiosClient.get<ApiResponse<Role[]>>("/roles", {
      params,
    });
    return response.data.data;
  },

  get: async (id: string): Promise<Role> => {
    const response = await axiosClient.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },

  create: async (payload: RolePayload): Promise<Role> => {
    const { data } = await axiosClient.post<ApiResponse<Role>>(
      "/roles",
      payload,
    );
    return data.data;
  },

  update: async (id: string, payload: Partial<RolePayload>): Promise<Role> => {
    const { data } = await axiosClient.put<ApiResponse<Role>>(
      `/roles/${id}`,
      payload,
    );
    return data.data;
  },

  assignPermissions: async (
    entries: { roleId: string; permissionId: string }[],
  ): Promise<void> => {
    await axiosClient.post("/role/permission", entries);
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/roles/${id}`);
  },
  getRoleByUserId: async (id: string) => {
    await axiosClient.get(`/role/user/${id}`);
  },
};

export default roleService;
