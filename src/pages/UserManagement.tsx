

import {
  Tabs,
} from "antd";
import type { TabsProps } from "antd";

import UserTab from "../components/user/UserTab";
import PermissionTab from "../components/user/PermissionTab";

export default function UserManagement() {

  const tabItem: TabsProps["items"] = [
    {
      key: '1',
      label: 'Quản lý người dùng',
      children: <UserTab />,
    }, {
      key: '2',
      label: 'Quản lý phân quyền',
      children: <PermissionTab />,
    },
  ]

  return (
    <Tabs items={tabItem} defaultActiveKey="1" />
  );
}
