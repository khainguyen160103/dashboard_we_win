/**
 * PermissionManagement — Trang Quản lý Phân quyền
 *
 * Gồm:
 *  1. Thanh công cụ phía trên: Select người dùng để phân quyền & 2 nút Thêm Role / Quyền
 *  2. Bảng Ma trận Role × Permission dạng checkbox
 */

import { useState } from "react";
import { Button, Card, Flex, Select, Space, message } from "antd";
import { UserOutlined, KeyOutlined, TeamOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

import {
  RolePermissionMatrix,
  AddRoleModal,
  AddPermissionModal,
  mockRoles,
  mockPermissions,
  mockRolePermissionMap,
  mockUsers,
} from "../features/permission";

import type {
  RoleRow,
  PermissionCol,
  UserRow,
  RolePermissionMap,
} from "../features/permission";

export default function PermissionManagement() {
  // ── State (Mock Data) ──────────────────────────────────────────────────────
  const [roles, setRoles]                 = useState<RoleRow[]>(mockRoles);
  const [permissions, setPermissions]     = useState<PermissionCol[]>(mockPermissions);
  const [permissionMap, setPermissionMap] = useState<RolePermissionMap>(mockRolePermissionMap);
  const [users, setUsers]                 = useState<UserRow[]>(mockUsers);

  // ── Người dùng đang được chọn trên thanh công cụ ──────────────────────────
  const [selectedUserId, setSelectedUserId] = useState<string | null>("u1"); // Mặc định chọn Nguyễn Văn Khải

  // ── State Modals ──────────────────────────────────────────────────────────
  const [addRoleOpen, setAddRoleOpen]             = useState(false);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);

  // Lấy đối tượng người dùng đang được chọn
  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  // ── Xử lý khi tick/untick 1 ô trong Ma trận ──────────────────────────────
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

  // ── Xử lý gán Role trực tiếp cho người dùng từ Select bar ─────────────────
  const handleUserRolesChange = (newRoleCodes: string[]) => {
    if (!selectedUserId) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUserId ? { ...u, assignedRoles: newRoleCodes } : u
      )
    );
    message.success("Đã cập nhật vai trò cho người dùng!");
  };

  // ── Thêm role mới ──────────────────────────────────────────────────────────
  const handleAddRole = (newRole: Omit<RoleRow, "id">) => {
    const role: RoleRow = {
      ...newRole,
      id: Date.now(),
    };
    setRoles((prev) => [...prev, role]);
    message.success(`Đã thêm vai trò "${role.name}"!`);
    setAddRoleOpen(false);
  };

  // ── Thêm permission mới ────────────────────────────────────────────────────
  const handleAddPermission = (newPerm: Omit<PermissionCol, "id">) => {
    const perm: PermissionCol = {
      ...newPerm,
      id: Date.now(),
    };
    setPermissions((prev) => [...prev, perm]);
    message.success(`Đã thêm quyền "${perm.name}"!`);
    setAddPermissionOpen(false);
  };

  return (
    <>
      <PageMeta
        title="Quản lý Phân quyền"
        description="Ma trận Role x Permission và phân quyền trực tiếp cho người dùng"
      />
      <PageBreadcrumb pageTitle="Quản lý Phân quyền (RBAC)" />

      {/* ── Toolbar phía trên Ma trận: Select chọn Người dùng & Gán Role ── */}
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
                value={selectedUserId}
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
                  options={roles.map((r) => ({
                    value: r.code,
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
            >
              + Thêm Vai trò
            </Button>
            <Button
              type="primary"
              icon={<KeyOutlined />}
              onClick={() => setAddPermissionOpen(true)}
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
