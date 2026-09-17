import { Button, Popconfirm, Space, Spin, Table, TableColumnsType, Tag } from "antd";
import { User } from "../../model/User";

export const UserTable = ({ handleOpenEdit, handleDelete, handleUpdateStatus, userData, isLoading, isFetching }: any) => {
    const statusFormat = { 
        "ACTIVE": "Đang hoạt động",
        "INACTIVE": "Không hoạt động"
    }
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
            render: (status: string) => <Tag color={status === "ACTIVE" ? "blue" : "error"}>{statusFormat[status as keyof typeof statusFormat]}</Tag>,
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
    <div>
        <Spin spinning={isLoading || isFetching}>
              <Table<User>
                  columns={columns}
                  dataSource={userData}
                  rowKey="id"
                  bordered

              />
        </Spin>      
        
         
    </div>
  )
}
