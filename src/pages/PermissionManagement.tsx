/**
 * PermissionManagement — Trang Quản lý Phân quyền (RBAC)
 *
 * Tích hợp REST API qua các hooks:
 *  - useRolesQuery       → danh sách tất cả Role (+ permissions của từng role)
 *  - usePermissionsQuery → danh sách tất cả Permission
 *  - useUsersQuery       → danh sách Người dùng
 *  - useUserQuery        → chi tiết User khi được select (roles + permissions thực)
 *  - useAssignRolesToUserMutation      → PUT /users/{id}/roles
 *  - useAssignPermissionsToRoleMutation → POST /role/permission
 */

import { useState, useMemo } from "react";
import {
  Button,
  Card,
  Collapse,
  Flex,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  KeyOutlined,
  LockOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
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

import {
  useRolesQuery,
  useCreateRoleMutation,
  useAssignPermissionsToRoleMutation,
} from "../hooks/query/useRoleQuery";
import {
  usePermissionsQuery,
  useCreatePermissionMutation,
} from "../hooks/query/usePermissionQuery";
import {
  useUsersQuery,
  useUserQuery,
  useAssignRolesToUserMutation,
} from "../hooks/useUser";
import type { User } from "../model/User";
import type { Role } from "../model/Role";
import type { Permission } from "../model/Permission";

// ─── Helper: unwrap Spring Page / ApiResponse array ──────────────────────────
function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.content)) return inner.content as T[];
    }
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

export default function PermissionManagement() {
  // ── 1. Call REST API Hooks ─────────────────────────────────────────────────
  const { data: apiRoles, isLoading: isLoadingRoles } = useRolesQuery();
  const { data: apiPermissions, isLoading: isLoadingPermissions } = usePermissionsQuery();
  const { data: apiUsers, isLoading: isLoadingUsers } = useUsersQuery();

  const createRoleMutation = useCreateRoleMutation();
  const createPermissionMutation = useCreatePermissionMutation();
  const assignRolesToUserMutation = useAssignRolesToUserMutation();
  const assignPermissionsToRoleMutation = useAssignPermissionsToRoleMutation();

  // ── 2. State ───────────────────────────────────────────────────────────────
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [permissionMap, setPermissionMap] = useState<RolePermissionMap>({});
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);

  // ── 3. Fetch user detail when a user is selected ──────────────────────────
  const { data: userDetail, isLoading: isLoadingUserDetail } = useUserQuery(
    selectedUserId ?? "",
    !!selectedUserId,
  );

  // ── 4. Format REST API Data → Component Props ──────────────────────────────
  const roles: RoleRow[] = useMemo(() => {
    const rawList: Role[] = unwrapList(apiRoles);
    return rawList.map((r) => ({
      id: (r.id as unknown as number) || Date.now(),
      name: r.name,
      code: r.code || r.name.toUpperCase().replace(/\s+/g, "_"),
      description: r.description || "",
    }));
  }, [apiRoles]);

  const permissions: PermissionCol[] = useMemo(() => {
    const rawList: Permission[] = unwrapList(apiPermissions);
    return rawList.map((p) => ({
      id: (p.id as unknown as number) || Date.now(),
      name: p.name,
      code: p.code || p.name.toUpperCase().replace(/\s+/g, "_"),
      resource: p.resource || "system",
      action: p.action || "read",
    }));
  }, [apiPermissions]);

  const users: UserRow[] = useMemo(() => {
    const rawList: User[] = unwrapList(apiUsers);
    return rawList.map((u) => {
      const uObj = u as unknown as Record<string, unknown>;
      let assignedRoles: string[] = [];

      if (Array.isArray(u.roles) && u.roles.length > 0) {
        // roles là Role[] từ backend
        assignedRoles = u.roles.map((r) =>
          typeof r === "object" && r !== null
            ? ((r as unknown as Record<string, string>).id ?? (r as unknown as Record<string, string>).code ?? "")
            : String(r),
        );
      } else if (typeof uObj.roleId === "string") {
        assignedRoles = [uObj.roleId];
      }

      return {
        id: u.id,
        fullName: u.fullName || u.username || u.email || "N/A",
        email: u.email || "",
        status: u.status?.toUpperCase() === "ACTIVE" ? "Active" : "Inactive",
        assignedRoles,
      };
    });
  }, [apiUsers]);

  // ── 5. Derive selected user info ───────────────────────────────────────────
  const activeSelectedUserId = selectedUserId || (users.length > 0 ? users[0].id : null);
  const selectedUserRow = users.find((u) => u.id === activeSelectedUserId) || null;

  // Roles of the selected user from the detail API (has permissions inside)
  const selectedUserRoles: Role[] = useMemo(() => {
    if (!userDetail) return [];
    if (Array.isArray(userDetail.roles)) return userDetail.roles as Role[];
    return [];
  }, [userDetail]);

  // IDs of roles currently assigned to the selected user (for the Select control)
  const selectedUserRoleIds: string[] = useMemo(
    () => selectedUserRoles.map((r) => r.id),
    [selectedUserRoles],
  );

  // ── 6. Build permissionMap from the role detail data in apiRoles ───────────
  // Each Role from /roles endpoint contains List<PermissionDto>
  const apiPermissionMap: RolePermissionMap = useMemo(() => {
    const rawRoles: Role[] = unwrapList(apiRoles);
    const map: RolePermissionMap = {};
    for (const role of rawRoles) {
      if (role.code && Array.isArray(role.permissions)) {
        map[role.code] = new Set(role.permissions.map((p) => p.code));
      }
    }
    return map;
  }, [apiRoles]);

  // Merge API map with any local edits (local edits override)
  const effectivePermissionMap: RolePermissionMap = useMemo(() => {
    return { ...apiPermissionMap, ...permissionMap };
  }, [apiPermissionMap, permissionMap]);

  // Highlighted role codes = roles assigned to selected user
  const highlightedRoleCodes: string[] = useMemo(
    () => selectedUserRoles.map((r) => r.code),
    [selectedUserRoles],
  );

  // ── 7. Handlers ──────────────────────────────────────────────────────────
  const handleMatrixChange = async (roleCode: string, permCode: string, checked: boolean) => {
    // Optimistic UI update
    setPermissionMap((prev) => {
      const updated = { ...prev };
      const rolePerms = new Set(updated[roleCode] ?? apiPermissionMap[roleCode] ?? []);
      if (checked) rolePerms.add(permCode);
      else rolePerms.delete(permCode);
      updated[roleCode] = rolePerms;
      return updated;
    });

    if (!checked) return; // Only POST on adding permission (API only supports add)

    // Find IDs from code
    const rawRoles: Role[] = unwrapList(apiRoles);
    const targetRole = rawRoles.find((r) => r.code === roleCode);
    const targetPerm = (unwrapList(apiPermissions) as Permission[]).find((p) => p.code === permCode);

    if (!targetRole || !targetPerm) {
      message.warning("Không tìm thấy role hoặc permission trong danh sách.");
      return;
    }

    try {
      await assignPermissionsToRoleMutation.mutateAsync([
        { roleId: targetRole.id, permissionId: String(targetPerm.id) },
      ]);
      message.success(`Đã gán quyền "${permCode}" cho role "${roleCode}"`);
    } catch {
      message.error("Gán quyền thất bại, vui lòng thử lại.");
      // Revert optimistic
      setPermissionMap((prev) => {
        const updated = { ...prev };
        const rolePerms = new Set(updated[roleCode] ?? []);
        rolePerms.delete(permCode);
        updated[roleCode] = rolePerms;
        return updated;
      });
    }
  };

  const handleUserRolesChange = async (newRoleIds: string[]) => {
    if (!activeSelectedUserId) return;
    try {
      await assignRolesToUserMutation.mutateAsync({
        id: activeSelectedUserId,
        roleIds: newRoleIds,
      });
      message.success("Đã cập nhật vai trò cho người dùng!");
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
      message.success(`Đã thêm vai trò "${newRole.name}"!`);
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
      message.success(`Đã thêm quyền "${newPerm.name}"!`);
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
      <PageBreadcrumb pageTitle="Phân Quyền Người Dùng" />

      <Spin spinning={isDataLoading} tip="Đang nạp dữ liệu phân quyền từ server...">

        {/* ── Toolbar: Chọn User & Gán Role ── */}
        <Card style={{ marginBottom: 16, backgroundColor: "#fafafa" }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>

            {/* Chọn User */}
            <Space size={16} wrap>
              <Space>
                <UserOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <span style={{ fontWeight: 600 }}>Chọn người dùng:</span>
                <Select
                  showSearch
                  placeholder="-- Tìm / Chọn người dùng --"
                  style={{ width: 300 }}
                  value={activeSelectedUserId}
                  onChange={(val) => setSelectedUserId(val ?? null)}
                  allowClear
                  optionFilterProp="label"
                  options={users.map((u) => ({
                    value: u.id,
                    label: `${u.fullName} (${u.email})`,
                  }))}
                />
              </Space>

              {/* Gán Role cho User đang chọn */}
              {selectedUserRow && (
                <Space wrap>
                  <span style={{ fontSize: 13, color: "#595959" }}>
                    <TeamOutlined /> Phân vai trò:
                  </span>
                  <Select
                    mode="multiple"
                    placeholder="Gán role cho user"
                    style={{ minWidth: 260 }}
                    value={selectedUserRoleIds}
                    onChange={handleUserRolesChange}
                    loading={assignRolesToUserMutation.isPending || isLoadingUserDetail}
                    optionFilterProp="label"
                    options={roles.map((r) => ({
                      value: r.id ? String(r.id) : r.code,
                      label: `${r.name} (${r.code})`,
                    }))}
                  />
                </Space>
              )}
            </Space>

            {/* Nút Thêm Role & Thêm Quyền */}
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
        </Card>


        {/* ── Bảng Ma trận Role x Permission ── */}
        <Card>
          {/* ── Thông tin Role & Permission của User đang chọn ── */}
          {selectedUserRow && (
            <div style={{ marginBottom: 16 }}>
              {/* Header: tên user + status */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <UserOutlined style={{ color: "#1890ff", fontSize: 15 }} />
                <span style={{ fontWeight: 600, fontSize: 13, color: "#262626" }}>
                  {selectedUserRow.fullName}
                </span>
                <Tag color={selectedUserRow.status === "Active" ? "green" : "red"} style={{ margin: 0 }}>
                  {selectedUserRow.status}
                </Tag>
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>{selectedUserRow.email}</span>
                {isLoadingUserDetail && (
                  <span style={{ fontSize: 11, color: "#1890ff" }}>Đang tải...</span>
                )}
              </div>

              {/* Danh sách Role + Permission của từng role */}
              {selectedUserRoles.length === 0 && !isLoadingUserDetail ? (
                <div style={{ fontSize: 12, color: "#8c8c8c", fontStyle: "italic" }}>
                  Người dùng chưa được gán vai trò nào.
                </div>
              ) : (
                <Collapse
                  size="small"
                  ghost
                  style={{ border: "1px solid #f0f0f0", borderRadius: 6, background: "#fafafa" }}
                  items={selectedUserRoles.map((role) => {
                    const permList = Array.isArray(role.permissions) ? role.permissions : [];
                    return {
                      key: role.id,
                      label: (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <LockOutlined style={{ color: "#722ed1", fontSize: 12 }} />
                          <strong style={{ fontSize: 13 }}>{role.name}</strong>
                          <Tag color="purple" style={{ fontSize: 10, margin: 0, lineHeight: "18px" }}>
                            {role.code}
                          </Tag>
                          <Tag
                            color={permList.length > 0 ? "geekblue" : "default"}
                            style={{ fontSize: 10, margin: 0, lineHeight: "18px" }}
                          >
                            {permList.length} quyền
                          </Tag>
                        </span>
                      ),
                      children: permList.length === 0 ? (
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                          Role này chưa có quyền nào.
                        </span>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {permList.map((perm) => (
                            <Tooltip
                              key={perm.id}
                              title={`Resource: ${perm.resource ?? "–"} | Action: ${perm.action ?? "–"}`}
                            >
                              <Tag
                                color="green"
                                icon={<CheckCircleOutlined />}
                                style={{ cursor: "default", fontSize: 11, margin: 0 }}
                              >
                                {perm.name}
                                {perm.code && (
                                  <span style={{ marginLeft: 3, opacity: 0.65, fontSize: 10 }}>
                                    ({perm.code})
                                  </span>
                                )}
                              </Tag>
                            </Tooltip>
                          ))}
                        </div>
                      ),
                    };
                  })}
                />
              )}

              <div style={{ marginTop: 10, fontSize: 11, color: "#1890ff" }}>
                💡 Hàng màu xanh nhạt trong ma trận bên dưới là các role của{" "}
                <strong>{selectedUserRow.fullName}</strong>. Tick checkbox để gán quyền cho Role.
              </div>
            </div>
          )}

          <RolePermissionMatrix
            roles={roles}
            permissions={permissions}
            permissionMap={effectivePermissionMap}
            onChange={handleMatrixChange}
            highlightedRoleCodes={highlightedRoleCodes}
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
