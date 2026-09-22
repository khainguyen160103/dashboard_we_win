import { Tabs, TabsProps } from "antd";
import { Permission } from "../components/permission/Permission"
import User from "../components/user/User";
import { Role } from "../components/role/Role";


const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Quản lý người dùng',
    children: <User />,
  },
  {
    key: '2',
    label: 'Quản lý Quyền',
    children: <Role />,
  },
  {
    key: '3',
    label: 'Quản lý vai trò',
    children: <Permission />,
  },
];
export const PermissionManagement = () => {
  return (
    <div className="bg-white shadow-2xl rounded-2xl h-full p-4">
      <Tabs defaultActiveKey="1"
        items={items}
      />
    </div>
  )
}
