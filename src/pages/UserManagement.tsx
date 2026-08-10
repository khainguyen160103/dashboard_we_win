import { useState } from "react";
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

type UserRecord = {
  id: number;
  name: string;
  email: string;
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

const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":   return "red";
    case "Manager": return "blue";
    default:        return "default";
  }
};

const getStatusColor = (status: string) =>
  status === "Active" ? "success" : "default";

// ─── Modal Form Component ─────────────────────────────────────────────────────
function UserModal({
  open,
  editingUser,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editingUser: UserRecord | null;
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
        role: editingUser.role,
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
      .catch(() => {});
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
      destroyOnClose
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
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select placeholder="Chọn vai trò">
            <Select.Option value="Admin">Admin</Select.Option>
            <Select.Option value="Manager">Manager</Select.Option>
            <Select.Option value="Affiliate">Affiliate</Select.Option>
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

  const users: UserRecord[] = [
    { id: 1,  name: "Nguyen Van A",     email: "nguyenvana@gmail.com",     role: "Admin",     status: "Active",   joinDate: "2024-01-15", campaigns: 45 },
    { id: 2,  name: "Tran Thi B",       email: "tranthib@gmail.com",       role: "Affiliate", status: "Active",   joinDate: "2024-02-20", campaigns: 38 },
    { id: 3,  name: "Le Van C",         email: "levanc@gmail.com",         role: "Affiliate", status: "Inactive", joinDate: "2024-03-10", campaigns: 32 },
    { id: 4,  name: "Pham Thi D",       email: "phamthid@gmail.com",       role: "Manager",   status: "Active",   joinDate: "2024-01-05", campaigns: 28 },
    { id: 5,  name: "Hoang Van E",      email: "hoangvane@gmail.com",      role: "Affiliate", status: "Active",   joinDate: "2024-04-12", campaigns: 24 },
    { id: 6,  name: "Vu Thi F",         email: "vuthif@gmail.com",         role: "Affiliate", status: "Active",   joinDate: "2024-05-08", campaigns: 18 },
    { id: 7,  name: "Dang Van G",       email: "dangvang@gmail.com",       role: "Affiliate", status: "Active",   joinDate: "2024-05-15", campaigns: 55 },
    { id: 8,  name: "Bui Thi H",        email: "buithih@gmail.com",        role: "Manager",   status: "Active",   joinDate: "2024-06-01", campaigns: 42 },
    { id: 9,  name: "Do Van I",         email: "dovani@gmail.com",         role: "Affiliate", status: "Inactive", joinDate: "2024-06-20", campaigns: 11 },
    { id: 10, name: "Ngo Thi J",        email: "ngothij@gmail.com",        role: "Affiliate", status: "Active",   joinDate: "2024-07-03", campaigns: 33 },
    { id: 11, name: "Ly Van K",         email: "lyvank@gmail.com",         role: "Admin",     status: "Active",   joinDate: "2024-07-18", campaigns: 67 },
    { id: 12, name: "Trinh Thi L",      email: "trinhthil@gmail.com",      role: "Affiliate", status: "Active",   joinDate: "2024-08-05", campaigns: 20 },
    { id: 13, name: "Truong Van M",     email: "truongvanm@gmail.com",     role: "Affiliate", status: "Inactive", joinDate: "2024-08-22", campaigns: 9  },
    { id: 14, name: "Dinh Thi N",       email: "dinhnthin@gmail.com",      role: "Manager",   status: "Active",   joinDate: "2024-09-10", campaigns: 51 },
    { id: 15, name: "Ta Van O",         email: "tavano@gmail.com",         role: "Affiliate", status: "Active",   joinDate: "2024-09-25", campaigns: 29 },
    { id: 16, name: "Luong Thi P",      email: "luongthip@gmail.com",      role: "Affiliate", status: "Active",   joinDate: "2024-10-07", campaigns: 16 },
    { id: 17, name: "Ha Van Q",         email: "havanq@gmail.com",         role: "Affiliate", status: "Inactive", joinDate: "2024-10-19", campaigns: 7  },
    { id: 18, name: "Cao Thi R",        email: "caothir@gmail.com",        role: "Affiliate", status: "Active",   joinDate: "2024-11-01", campaigns: 44 },
    { id: 19, name: "Mai Van S",        email: "maivans@gmail.com",        role: "Manager",   status: "Active",   joinDate: "2024-11-14", campaigns: 37 },
    { id: 20, name: "Vuong Thi T",      email: "vuongthit@gmail.com",      role: "Affiliate", status: "Active",   joinDate: "2024-11-28", campaigns: 22 },
    { id: 21, name: "Lam Van U",        email: "lamvanu@gmail.com",        role: "Affiliate", status: "Inactive", joinDate: "2024-12-05", campaigns: 14 },
    { id: 22, name: "Huynh Thi V",      email: "huynthiv@gmail.com",       role: "Affiliate", status: "Active",   joinDate: "2024-12-12", campaigns: 30 },
    { id: 23, name: "Kieu Van W",       email: "kieuvanw@gmail.com",       role: "Affiliate", status: "Active",   joinDate: "2025-01-04", campaigns: 19 },
    { id: 24, name: "Chau Thi X",       email: "chauthix@gmail.com",       role: "Manager",   status: "Active",   joinDate: "2025-01-18", campaigns: 48 },
    { id: 25, name: "Tong Van Y",       email: "tongvany@gmail.com",       role: "Affiliate", status: "Inactive", joinDate: "2025-02-01", campaigns: 5  },
    { id: 26, name: "Quan Thi Z",       email: "quanthiz@gmail.com",       role: "Affiliate", status: "Active",   joinDate: "2025-02-14", campaigns: 26 },
    { id: 27, name: "Phan Van An",      email: "phanvanan@gmail.com",      role: "Affiliate", status: "Active",   joinDate: "2025-03-01", campaigns: 35 },
    { id: 28, name: "Vo Thi Binh",      email: "vothibinh@gmail.com",      role: "Admin",     status: "Active",   joinDate: "2025-03-15", campaigns: 72 },
    { id: 29, name: "Nguyen Van Cuong", email: "nguyenvancuong@gmail.com", role: "Affiliate", status: "Inactive", joinDate: "2025-04-01", campaigns: 3  },
    { id: 30, name: "Le Thi Dung",      email: "lethidung@gmail.com",      role: "Manager",   status: "Active",   joinDate: "2025-04-20", campaigns: 60 },
  ];

  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: UserRecord) => {
    setEditingUser(record);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (values: UserFormValues) => {
    if (editingUser) {
      message.success(`Đã cập nhật người dùng "${values.name}"`);
    } else {
      message.success(`Đã thêm người dùng "${values.name}"`);
    }
    setModalOpen(false);
    setEditingUser(null);
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
    {
      title: "Vai Trò",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Admin", value: "Admin" },
        { text: "Manager", value: "Manager" },
        { text: "Affiliate", value: "Affiliate" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role: string) => <Tag color={getRoleColor(role)}>{role}</Tag>,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
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
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng"
            description={`Bạn có chắc muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => message.success(`Đã xóa: ${record.name}`)}
          >
            <Button type="primary" size="small" danger>
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
        description="Trang quản lý người dùng với mock data demo"
      />
      <PageBreadcrumb pageTitle="Quản lý người dùng" />

      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Input.Search
          placeholder="Tìm kiếm người dùng..."
          style={{ width: 400 }}
          allowClear
        />
        <Button type="primary" onClick={handleOpenAdd}>
          + Thêm Người Dùng
        </Button>
      </Flex>

      <Table<UserRecord>
        columns={columns}
        dataSource={users}
        rowKey="id"
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
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}
