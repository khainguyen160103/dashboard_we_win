/**
 * UserRoleTable
 *
 * Bảng danh sách người dùng với vai trò hiện tại của họ
 * Mỗi người dùng có nút "Phân quyền" để mở AssignRoleModal
 */

import { Avatar, Badge, Button, Input, Space, Table, Tag } from "antd";
import { KeyOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { UserRow } from "./types";
import { useState } from "react";

type Props = {
  users: UserRow[];
  onAssignClick: (user: UserRow) => void;
};

export function UserRoleTable({ users, onAssignClick }: Props) {
  const [searchText, setSearchText] = useState("");

  // Lọc người dùng theo tên hoặc email
  const filteredUsers = users.filter((user) => {
    if (!searchText) return true;
    const keyword = searchText.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    );
  });

  const columns: TableColumnsType<UserRow> = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò hiện tại",
      key: "roles",
      render: (_, record) =>
        record.assignedRoles.length > 0 ? (
          <Space wrap>
            {record.assignedRoles.map((roleCode) => (
              <Tag key={roleCode} color="blue">{roleCode}</Tag>
            ))}
          </Space>
        ) : (
          <Tag color="default">Chưa được phân quyền</Tag>
        ),
    },
    {
      title: "Trạng thái tài khoản",
      key: "status",
      width: 160,
      render: (_, record) => (
        <Badge
          status={record.status === "Active" ? "success" : "default"}
          text={record.status === "Active" ? "Đang hoạt động" : "Không hoạt động"}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 130,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<KeyOutlined />}
          onClick={() => onAssignClick(record)}
        >
          Phân quyền
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Thanh tìm kiếm */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ width: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      {/* Bảng người dùng */}
      <Table<UserRow>
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        bordered
        size="middle"
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </div>
  );
}
