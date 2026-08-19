import { useState, useMemo } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../hooks/useUser";
import { useRolesQuery } from "../hooks/query/useRoleQuery";
import type { User } from "../model/User";
import type { Role } from "../model/Role";

const FALLBACK_ROLES: Role[] = [
  { id: "a1000000-0000-0000-0000-000000000001", name: "Administrator", code: "ADMIN", description: "Full system access" },
  { id: "a1000000-0000-0000-0000-000000000002", name: "PM", code: "PM", description: "Manage job information" },
  { id: "a1000000-0000-0000-0000-000000000003", name: "KOC", code: "KOC", description: "Read self information" },
  { id: "a1000000-0000-0000-0000-000000000004", name: "SaleAccount", code: "SA", description: "Read job & KOC info" },
  { id: "a1000000-0000-0000-0000-000000000005", name: "BRAND", code: "BRAND", description: "Manage brand information" },
];

type UserRecord = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: string;
  status: string;
  joinDate: string;
  campaigns: number;
};

type UserFormValues = {
  name: string;
  email: string;
  role: string;
  status: string;
};

const getStatusColor = (status: string) => {
  const s = status?.toUpperCase();
  return s === "ACTIVE" || s === "SUCCESS" ? "success" : "default";
};

// ─── Modal Form Component ─────────────────────────────────────────────────────
function UserModal({
  open,
  editingUser,
  rolesList,
  isLoadingRoles,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editingUser: UserRecord | null;
  rolesList: Role[];
  isLoadingRoles?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}) {
  const [form] = Form.useForm<UserFormValues>();
  const isEditing = editingUser !== null;

  // Pre-fill form when editing
  const handleAfterOpen = (isOpen: boolean) => {
    if (isOpen && editingUser) {
      form.setFieldsValue({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.roleId || editingUser.role,
        status: editingUser.status,
      });
    }
    if (!isOpen) {
      form.resetFields();
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
        form.resetFields();
      })
      .catch(() => { });
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEditing ? "Lưu thay đổi" : "Thêm mới"}
      cancelText="Hủy"
      afterOpenChange={handleAfterOpen}
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="example@gmail.com" disabled={isEditing} />
        </Form.Item>

        <Form.Item
          label="Vai trò (Role)"
          name="role"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select
            placeholder="Chọn vai trò"
            loading={isLoadingRoles}
            showSearch
            optionFilterProp="label"
          >
            {rolesList.map((r) => (
              <Select.Option key={r.id} value={r.id} label={`${r.name} ${r.code}`}>
                {r.name} ({r.code}){r.description ? ` — ${r.description}` : ""}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch cached roles from REST API (GET /roles)
  const { data: apiRoles, isLoading: isLoadingRoles } = useRolesQuery();

  const rolesList = useMemo(() => {
    if (Array.isArray(apiRoles) && apiRoles.length > 0) {
      return apiRoles;
    }
    return FALLBACK_ROLES;
  }, [apiRoles]);

  // 2. Fetch users from REST API (GET /users)
  const { data: apiUsers, isLoading, isFetching } = useUsersQuery({ q: searchQuery });
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  // Transform backend API User objects to display UserRecord
  const displayUsers: UserRecord[] = useMemo(() => {
    let rawList: User[] = [];
    if (Array.isArray(apiUsers)) {
      rawList = apiUsers;
    } else if (apiUsers && typeof apiUsers === "object") {
      const resObj = apiUsers as unknown as Record<string, unknown>;
      if (Array.isArray(resObj.content)) {
        rawList = resObj.content as User[];
      } else if (
        resObj.data &&
        typeof resObj.data === "object" &&
        Array.isArray((resObj.data as Record<string, unknown>).content)
      ) {
        rawList = (resObj.data as Record<string, unknown>).content as User[];
      } else if (Array.isArray(resObj.data)) {
        rawList = resObj.data as User[];
      }
    }

    if (rawList.length > 0) {
      return rawList.map((u: User) => {
        let roleId = rolesList[0]?.id || "a1000000-0000-0000-0000-000000000003";
        const uObj = u as unknown as Record<string, unknown>;

        if (typeof uObj.roleId === "string") {
          roleId = uObj.roleId;
        } else if (Array.isArray(uObj.roleIds) && uObj.roleIds.length > 0) {
          roleId = String(uObj.roleIds[0]);
        } else if (u.admin || u.isAdmin) {
          roleId = "a1000000-0000-0000-0000-000000000001";
        } else if (Array.isArray(u.roles) && u.roles.length > 0) {
          const firstRole = u.roles[0];
          const firstRoleStr = typeof firstRole === "object" && firstRole !== null
            ? (firstRole.id ?? firstRole.code ?? "")
            : String(firstRole);
          const matched = rolesList.find(
            (r) => r.id === firstRoleStr || r.code === firstRoleStr || r.name === firstRoleStr
          );
          if (matched) roleId = matched.id;
        }

        const foundRole =
          rolesList.find((r) => r.id === roleId) ||
          rolesList.find((r) => r.code === roleId || r.name === roleId);

        const finalRoleId = foundRole ? foundRole.id : roleId;
        const finalRoleName = foundRole ? foundRole.name : String(uObj.role || roleId);

        const rawStatus = (u.status || "ACTIVE").toString().toUpperCase();
        const formattedStatus = rawStatus === "ACTIVE" ? "Active" : "Inactive";

        return {
          id: u.id,
          name: u.fullName || u.username || u.email || "N/A",
          email: u.email || "",
          roleId: finalRoleId,
          role: finalRoleName,
          status: formattedStatus,
          joinDate: u.createdAt ? new Date(u.createdAt as string).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          campaigns: Number(uObj.campaigns ?? 0),
        };
      });
    }
    return [];
  }, [apiUsers, rolesList]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: UserRecord) => {
    console.log(record);
    setEditingUser(record);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };
  const handleUpdateStatus = (userId: string, status: string) => {
    const payload = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateUserMutation.mutate({ id: userId, payload: { status: payload } });
  };
  const handleSubmit = async (values: UserFormValues) => {
    const selectedRoleId = values.role; // Role UUID string
    const formattedStatus = values.status?.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";

    // Exact backend payload format:
    // { "email": "...", "roleId": "...", "status": "ACTIVE", "fullName": "..." }
    const payload = {
      email: values.email,
      roleId: selectedRoleId,
      status: formattedStatus,
      fullName: values.name,
    };

    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: String(editingUser.id),
          payload: payload as unknown as Partial<User>,
        });
        message.success(`Đã cập nhật người dùng "${values.name}"`);
      } else {
        await createUserMutation.mutateAsync(payload as unknown as Partial<User>);
        message.success(`Đã thêm người dùng "${values.name}"`);
      }
      setModalOpen(false);
      setEditingUser(null);
    } catch {
      message.error("Có lỗi xảy ra khi kết nối với REST API server!");
    }
  };

  const handleDelete = async (record: UserRecord) => {
    try {
      await deleteUserMutation.mutateAsync(String(record.id));
      message.success(`Đã xóa người dùng "${record.name}"`);
    } catch {
      message.error("Có lỗi xảy ra khi xóa người dùng trên REST API server!");
    }
  };

  const columns: TableColumnsType<UserRecord> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    // {
    //   title: "Vai Trò",
    //   dataIndex: "roleId",
    //   key: "roleId",
    //   filters: rolesList.map((r) => ({ text: r.name, value: r.id })),
    //   onFilter: (value, record) => record.roleId === value || record.role === value,
    //   render: (roleId: string, record: UserRecord) => (
    //     <Tag color={getRoleColor(roleId, rolesList)}>
    //       {getRoleLabel(record.roleId || record.role, rolesList)}
    //     </Tag>
    //   ),
    // },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Campaigns",
      dataIndex: "campaigns",
      key: "campaigns",
      sorter: (a, b) => a.campaigns - b.campaigns,
      align: "center",
    },
    {
      title: "Ngày Tham Gia",
      dataIndex: "joinDate",
      key: "joinDate",
      sorter: (a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleOpenEdit(record)}
          >
            Xem chi tiết
          </Button>
          <Popconfirm
            title="Khóa tài khoản"
            description={`Bạn có chắc muốn khóa "${record.name}"?`}
            okText="Khóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => handleUpdateStatus(record.id, record.status)}
          >
            <Button type="primary" size="small" danger loading={updateUserMutation.isPending}>
              Khóa
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa người dùng"
            description={`Bạn có chắc muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="primary" size="small" danger loading={deleteUserMutation.isPending}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Quản lý người dùng"
        description="Trang quản lý người dùng tích hợp REST API với dynamic role caching"
      />
      <PageBreadcrumb pageTitle="Quản lý người dùng" />

      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Input.Search
          placeholder="Tìm kiếm người dùng..."
          style={{ width: 400 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={(val) => setSearchQuery(val)}
          allowClear
        />
        <Button
          type="primary"
          onClick={handleOpenAdd}
          loading={createUserMutation.isPending || updateUserMutation.isPending}
        >
          + Thêm Người Dùng
        </Button>
      </Flex>

      <Table<UserRecord>
        columns={columns}
        dataSource={displayUsers}
        rowKey="id"
        loading={isLoading || isFetching}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} người dùng`,
        }}
        bordered
        size="middle"
      />

      <UserModal
        open={modalOpen}
        editingUser={editingUser}
        rolesList={rolesList}
        isLoadingRoles={isLoadingRoles}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}
