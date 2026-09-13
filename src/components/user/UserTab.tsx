import { Button, Flex, Input, message, Popconfirm, Space, Table, TableColumnsType, Tag } from 'antd'
import {useState} from 'react'
import { User } from '../../model/User';
import { useUser } from '../../hooks/useUser';
type UserFormValues = {
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function UserTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { create, update, delete: deleteUser, getUsers } = useUser;
  const { data: usersData, isLoading, isFetching } = getUsers({ q: searchQuery });
 
  const usersList: User[] = Array.isArray(usersData) ? usersData : [];
  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: User) => {
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
    update().mutate({ id: userId, payload: { status: payload } });
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
        await update().mutateAsync({
          id: String(editingUser.id),
          payload: payload as unknown as Partial<User>,
        });
        message.success(`Đã cập nhật người dùng "${values.name}"`);
      } else {
        await create().mutateAsync(payload as unknown as Partial<User>);
        message.success(`Đã thêm người dùng "${values.name}"`);
      }
      setModalOpen(false);
      setEditingUser(null);
    } catch {
      message.error("Có lỗi xảy ra khi kết nối với REST API server!");
    }
  };
  // Giữ lại cho form thêm/sửa người dùng sẽ nối sau — tránh lỗi "unused" khi build.
  void handleClose;
  void handleSubmit;

  const handleDelete = async (record: User) => {
    try {
      await deleteUser().mutateAsync(String(record.id));
      message.success(`Đã xóa người dùng "${record.fullName}"`);
    } catch {
      message.error("Có lỗi xảy ra khi xóa người dùng trên REST API server!");
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    return s === "ACTIVE" || s === "SUCCESS" ? "success" : "default";
  };

  const columns: TableColumnsType<User> = [
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Đang hoạt động", value: "ACTIVE" },
        { text: "Không hoạt động", value: "INACTIVE" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
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
            description={`Bạn có chắc muốn khóa "${record.fullName}"?`}
            okText="Khóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => handleUpdateStatus(record.id, record.status)}
          >
            <Button type="primary" size="small" danger >
              Khóa
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa người dùng"
            description={`Bạn có chắc muốn xóa "${record.fullName}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="primary" size="small" danger >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
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
          // loading={create.isPending || updateUserMutation.isPending}
        >
          + Thêm Người Dùng
        </Button>
      </Flex> 

      <Table<User>
        columns={columns}
        dataSource={usersList}
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


    
    </>
  )
}
