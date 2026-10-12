import { api as axiosClient } from "../api/request";
import type {
  Permission,
  PermissionMap,
  PermissionPayload,
} from "../model/Permission";
import { ApiResponse, ApiResponsePage } from "../model/request";

export const permissionService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<Permission[]> => {
    const { data } = await axiosClient.get<ApiResponsePage<Permission>>(
      "/permissions",
      {
        params,
      },
    );
    return data?.data;
  },

  get: async (id: string | number): Promise<Permission> => {
    const { data } = await axiosClient.get<ApiResponse<Permission>>(
      `/permissions/${id}`,
    );
    return data?.data ?? data;
  },

  /** Quyền (menu) của chính user đang đăng nhập — mọi role đều gọi được. */
  getMyPermissions: async (): Promise<PermissionMap> => {
    const { data } = await axiosClient.get<ApiResponse<PermissionMap>>("/permissions/me");
    return data?.data ?? {};
  },

  getUserPermissions: async (id: string | number): Promise<PermissionMap> => {
    const { data } = await axiosClient.get<ApiResponse<PermissionMap>>(
      `/permissions/user/${id}`,
    );
    return data?.data ?? data;
  },

  getPermissionsByRoleId: async (id: string): Promise<Permission[]> => {
    const { data } = await axiosClient.get<ApiResponse<Permission[]>>(
      `/permissions/role/${id}`,
    );
    return data?.data;
  },
  saveByRole: async (
    roleId: string,
    permissions: Permission[],
  ): Promise<Permission[]> => {
    const { data } = await axiosClient.post<ApiResponse<Permission[]>>(
      `/permissions/role/${roleId}`,
      permissions,
    );
    return data?.data;
  },
  create: async (payload: PermissionPayload): Promise<Permission> => {
    const { data } = await axiosClient.post<ApiResponse<Permission>>(
      "/permissions",
      payload,
    );
    return data?.data ?? data;
  },

  update: async (
    id: string | number,
    payload: Partial<PermissionPayload>,
  ): Promise<Permission> => {
    const { data } = await axiosClient.put<ApiResponse<Permission>>(
      `/permissions/${id}`,
      payload,
    );
    return data?.data ?? data;
  },

  remove: async (id: string | number): Promise<void> => {
    await axiosClient.delete(`/permissions/${id}`);
  },
};

export default permissionService;
