/**
 * PermissionManagement — Trang Quản lý Phân quyền (RBAC)
 *
 * Tích hợp REST API qua các hooks:
 *  - useRolesQuery (lấy danh sách Role)
 *  - usePermissionsQuery (lấy danh sách Permission)
 *  - useUsersQuery (lấy danh sách Người dùng & Role được gán)
 */

import { useState, useMemo } from "react";
import { Button, Card, Flex, Select, Space, Spin, message } from "antd";
import { UserOutlined, KeyOutlined, TeamOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

import {
  RolePermissionMatrix,
  AddRoleModal,
  AddPermissionModal,
} from "../features/permission";

import type {
  RoleRow,
  PermissionCol,
  UserRow,
  RolePermissionMap,
} from "../features/permission";

import { useRolesQuery, useCreateRoleMutation } from "../hooks/query/useRoleQuery";
import { usePermissionsQuery, useCreatePermissionMutation } from "../hooks/query/usePermissionQuery";
import { useUsersQuery, useUpdateUserMutation } from "../hooks/useUser";
import type { User } from "../model/User";
import type { Role } from "../model/Role";
import type { Permission } from "../model/Permission";

export default function PermissionManagement() {
  // ── 1. Call REST API Hooks ─────────────────────────────────────────────────
  const { data: apiRoles, isLoading: isLoadingRoles } = useRolesQuery();
  const { data: apiPermissions, isLoading: isLoadingPermissions } = usePermissionsQuery();
  const { data: apiUsers, isLoading: isLoadingUsers } = useUsersQuery();

  const createRoleMutation = useCreateRoleMutation();
  const createPermissionMutation = useCreatePermissionMutation();
  const updateUserMutation = useUpdateUserMutation();

  // ── 2. Format REST API Data to Component Props ──────────────────────────────
  const roles: RoleRow[] = useMemo(() => {
    let rawList: Role[] = [];
    if (Array.isArray(apiRoles)) {
      rawList = apiRoles;
    } else if (apiRoles && typeof apiRoles === "object") {
      const resObj = apiRoles as unknown as Record<string, unknown>;
      if (Array.isArray(resObj.content)) rawList = resObj.content as Role[];
      else if (Array.isArray(resObj.data)) rawList = resObj.data as Role[];
    }

    if (rawList.length > 0) {
      return rawList.map((r) => ({
        id: (r.id as unknown as number) || Date.now(),
        name: r.name,
        code: r.code || r.name.toUpperCase().replace(/\s+/g, "_"),
        description: r.description || "",
      }));
    }
    return [];
  }, [apiRoles]);

  const permissions: PermissionCol[] = useMemo(() => {
    let rawList: Permission[] = [];
    if (Array.isArray(apiPermissions)) {
      rawList = apiPermissions;
    } else if (apiPermissions && typeof apiPermissions === "object") {
      const resObj = apiPermissions as unknown as Record<string, unknown>;
      if (Array.isArray(resObj.content)) rawList = resObj.content as Permission[];
      else if (Array.isArray(resObj.data)) rawList = resObj.data as Permission[];
    }

    if (rawList.length > 0) {
      return rawList.map((p) => ({
        id: (p.id as unknown as number) || Date.now(),
        name: p.name,
        code: p.code || p.name.toUpperCase().replace(/\s+/g, "_"),
        resource: p.resource || "system",
        action: p.action || "read",
      }));
    }
    return [];
  }, [apiPermissions]);

  const users: UserRow[] = useMemo(() => {
    let rawList: User[] = [];
    if (Array.isArray(apiUsers)) {
      rawList = apiUsers;
    } else if (apiUsers && typeof apiUsers === "object") {
      const resObj = apiUsers as unknown as Record<string, unknown>;
      if (Array.isArray(resObj.content)) rawList = resObj.content as User[];
      else if (Array.isArray(resObj.data)) rawList = resObj.data as User[];
    }

    if (rawList.length > 0) {
      return rawList.map((u) => {
        const uObj = u as unknown as Record<string, unknown>;
        let assignedRoles: string[] = [];
        if (Array.isArray(u.roles)) {
          assignedRoles = u.roles.map((r) => (typeof r === "object" && r !== null ? (r as Record<string, string>).code || (r as Record<string, string>).id : String(r)));
        } else if (typeof uObj.roleId === "string") {
          assignedRoles = [uObj.roleId as string];
        }

        return {
          id: u.id,
          fullName: u.fullName || u.username || u.email || "N/A",
          email: u.email || "",
          status: u.status?.toUpperCase() === "ACTIVE" ? "Active" : "Inactive",
          assignedRoles,
        };
      });
    }
    return [];
  }, [apiUsers]);

  // ── 3. State Management ───────────────────────────────────────────────────
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [permissionMap, setPermissionMap] = useState<RolePermissionMap>({});

  // ── Modals State ──
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);

  // Auto select first user when users load
  const activeSelectedUserId = selectedUserId || (users.length > 0 ? users[0].id : null);
  const selectedUser = users.find((u) => u.id === activeSelectedUserId) || null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMatrixChange = (roleCode: string, permCode: string, checked: boolean) => {
    setPermissionMap((prev) => {
      const updatedMap = { ...prev };
      const rolePerms = new Set(updatedMap[roleCode] ?? []);

      if (checked) {
        rolePerms.add(permCode);
      } else {
        rolePerms.delete(permCode);
      }

      updatedMap[roleCode] = rolePerms;
      return updatedMap;
    });
  };

  const handleUserRolesChange = async (newRoleCodes: string[]) => {
    if (!activeSelectedUserId) return;
    try {
      await updateUserMutation.mutateAsync({
        id: activeSelectedUserId,
        payload: {
          roles: newRoleCodes,
          roleId: newRoleCodes[0] || "",
        } as unknown as Partial<User>,
      });
      message.success("Đã cập nhật vai trò cho người dùng qua REST API!");
    } catch {
      message.error("Có lỗi xảy ra khi cập nhật vai trò cho người dùng!");
    }
  };

  const handleAddRole = async (newRole: Omit<RoleRow, "id">) => {
    try {
      await createRoleMutation.mutateAsync({
        name: newRole.name,
        code: newRole.code,
        description: newRole.description,
        system: false,
      });
      message.success(`Đã thêm vai trò "${newRole.name}" qua REST API!`);
    } catch {
      message.error("Có lỗi xảy ra khi thêm vai trò mới!");
    }
    setAddRoleOpen(false);
  };

  const handleAddPermission = async (newPerm: Omit<PermissionCol, "id">) => {
    try {
      await createPermissionMutation.mutateAsync({
        name: newPerm.name,
        code: newPerm.code,
        resource: newPerm.resource,
        action: newPerm.action,
      });
      message.success(`Đã thêm quyền "${newPerm.name}" qua REST API!`);
    } catch {
      message.error("Có lỗi xảy ra khi thêm quyền mới!");
    }
    setAddPermissionOpen(false);
  };

  const isDataLoading = isLoadingRoles || isLoadingPermissions || isLoadingUsers;

  return (
    <>
      <PageMeta
        title="Quản lý Phân quyền"
        description="Ma trận Role x Permission tích hợp REST API"
      />
      <PageBreadcrumb pageTitle="Quản lý Phân quyền (RBAC)" />

      <Spin spinning={isDataLoading} tip="Đang nạp dữ liệu phân quyền từ server...">
        {/* ── Toolbar phía trên Ma trận ── */}
        <Card style={{ marginBottom: 20, backgroundColor: "#fafafa" }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
            
            {/* Phần Chọn Người Dùng & Gán Role */}
            <Space size={16} wrap>
              <Space>
                <UserOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <span style={{ fontWeight: 600 }}>Chọn người dùng:</span>
                <Select
                  showSearch
                  placeholder="-- Tìm / Chọn người dùng --"
                  style={{ width: 280 }}
                  value={activeSelectedUserId}
                  onChange={setSelectedUserId}
                  allowClear
                  options={users.map((u) => ({
                    value: u.id,
                    label: `${u.fullName} (${u.email})`,
                  }))}
                />
              </Space>

              {/* Khi đã chọn 1 user: hiển thị và cho phép sửa vai trò trực tiếp */}
              {selectedUser && (
                <Space wrap>
                  <span style={{ fontSize: 13, color: "#595959" }}>Phân vai trò:</span>
                  <Select
                    mode="multiple"
                    placeholder="Gán role cho user"
                    style={{ minWidth: 240 }}
                    value={selectedUser.assignedRoles}
                    onChange={handleUserRolesChange}
                    loading={updateUserMutation.isPending}
                    options={roles.map((r) => ({
                      value: r.code || String(r.id),
                      label: `${r.name} (${r.code})`,
                    }))}
                  />
                </Space>
              )}
            </Space>

            {/* Nút bấm Thêm Role & Thêm Quyền */}
            <Space>
              <Button
                icon={<TeamOutlined />}
                onClick={() => setAddRoleOpen(true)}
                loading={createRoleMutation.isPending}
              >
                + Thêm Vai trò
              </Button>
              <Button
                type="primary"
                icon={<KeyOutlined />}
                onClick={() => setAddPermissionOpen(true)}
                loading={createPermissionMutation.isPending}
              >
                + Thêm Quyền
              </Button>
            </Space>
          </Flex>

          {/* Thông báo mô tả nhỏ khi chọn User */}
          {selectedUser && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#1890ff" }}>
              💡 Hàng màu xanh nhạt trong ma trận bên dưới thể hiện các vai trò của người dùng{" "}
              <strong>{selectedUser.fullName}</strong>.
            </div>
          )}
        </Card>

        {/* ── Bảng Ma trận Role x Permission ── */}
        <Card title="Ma trận Phân quyền (Role × Permission)">
          <RolePermissionMatrix
            roles={roles}
            permissions={permissions}
            permissionMap={permissionMap}
            onChange={handleMatrixChange}
            highlightedRoleCodes={selectedUser?.assignedRoles ?? []}
          />
        </Card>
      </Spin>

      {/* Modals */}
      <AddRoleModal
        open={addRoleOpen}
        onClose={() => setAddRoleOpen(false)}
        onSubmit={handleAddRole}
      />

      <AddPermissionModal
        open={addPermissionOpen}
        onClose={() => setAddPermissionOpen(false)}
        onSubmit={handleAddPermission}
      />
    </>
  );
}
