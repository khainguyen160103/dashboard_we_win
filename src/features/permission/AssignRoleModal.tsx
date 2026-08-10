/**
 * AssignRoleModal
 *
 * Modal để phân quyền cho một người dùng cụ thể
 * Cho phép chọn nhiều Role bằng checkbox
 */

import { useState, useEffect } from "react";
import { Avatar, Checkbox, Divider, Modal, Space, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { RoleRow, UserRow } from "./types";

type Props = {
  open: boolean;
  user: UserRow | null;
  allRoles: RoleRow[];
  onClose: () => void;
  onSave: (userId: string, selectedRoleCodes: string[]) => void;
};

export function AssignRoleModal({ open, user, allRoles, onClose, onSave }: Props) {
  // Danh sách role code đang được chọn cho user này
  const [checkedRoles, setCheckedRoles] = useState<string[]>([]);

  // Khi mở modal: load role hiện tại của user vào state
  useEffect(() => {
    if (open && user) {
      setCheckedRoles(user.assignedRoles);
    }
  }, [open, user]);

  if (!user) return null;

  const handleSave = () => {
    onSave(user.id, checkedRoles);
  };

  const handleClose = () => {
    setCheckedRoles([]);
    onClose();
  };

  return (
    <Modal
      title="Phân quyền người dùng"
      open={open}
      onOk={handleSave}
      onCancel={handleClose}
      okText="Lưu phân quyền"
      cancelText="Hủy"
      destroyOnClose
    >
      {/* Thông tin người dùng */}
      <Space style={{ marginTop: 8, marginBottom: 4 }}>
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user.fullName}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>{user.email}</div>
        </div>
      </Space>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ marginBottom: 8, fontWeight: 600 }}>Chọn vai trò:</div>

      {/* Checkbox list: mỗi role một checkbox */}
      <Checkbox.Group
        value={checkedRoles}
        onChange={(values) => setCheckedRoles(values as string[])}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {allRoles.map((role) => (
          <Checkbox key={role.id} value={role.code}>
            <Space>
              <span style={{ fontWeight: 600 }}>{role.name}</span>
              <Tag style={{ fontSize: 10 }}>{role.code}</Tag>
            </Space>
            <div style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 24 }}>
              {role.description}
            </div>
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Modal>
  );
}
