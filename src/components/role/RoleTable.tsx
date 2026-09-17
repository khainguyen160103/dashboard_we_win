import { Table, TableColumnsType, Tag } from "antd";
import { Role } from "../../model/Role";

export const RoleTable = ({ roles }: { roles: Role[] }) => {
 
  const columns : TableColumnsType<Role> = [
    {
      title: 'Tên Vai Trò',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã Vai Trò',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Loại Vai Trò',
      dataIndex: 'system',
      key: 'system',
      render: (system: boolean) => system ? <Tag color="blue">Hệ Thống</Tag> : <Tag color="green">Người Dùng</Tag>,
    },
  ];

  

  return <Table<Role>
  bordered
  dataSource={roles} columns={columns} />;
}