import React from 'react'
import { roleQuery, permissionQuery, useUser } from '../../hooks/query';
import { Card, Checkbox, CheckboxProps, Col, Divider, Row, Select, Splitter, Table, TableColumnsType, Tooltip} from 'antd';
import { User } from '../../model/User';
import { Permission } from '../../model/Permission';

export default function PermissionTab() {
  const [userSelected, setUserSelected] = React.useState<User | null>(null);
  const [permissionsSelected, setPermissionsSelected] = React.useState<boolean>(false);
  const { getRoles } = roleQuery;
  const { getPermissions } = permissionQuery;
  const { getUsers } = useUser;

  const { data: usersData } = getUsers();
  const { data: roles } = getRoles();
  const { data: permissions } = getPermissions();
  console.log( permissions);

  const handleUserSelect = (userId: string | undefined) => {
    console.log(`selected user ${userId}`);
  }
  const options = usersData?.map((user: User) => ({
    value: user.id,
    label: `${user.fullName} (${user.email})`,
  })) || [];
  ;
  console.log("usersData", usersData);
  const defaultValue = {
    value: usersData?.[0].id ?? '',
    label: `${usersData?.[0].fullName || ''} (${usersData?.[0].email || ''})`
  }

  const onChange: CheckboxProps['onChange'] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };

 
  const itemTableColumns: TableColumnsType<Permission> = [
    {
      title: 'Module',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Create',
      dataIndex: 'canCreate',
      key: 'canCreate',
      render: (permission: Permission) => <Tooltip placement="topLeft" title={permission.code}>
        {permission.code}
        <Checkbox checked={permission.canView} onChange={() => onChange({ target: { checked: !permission.canView } } as any)}></Checkbox></Tooltip>
    },

    {
      title: 'READ',
      dataIndex: 'canView',
      key: 'canView',
      render: (permission: Permission) => <Tooltip placement="topLeft" title={permission.code}>
        {permission.code}
        <Checkbox checked={permission.canView} onChange={() => onChange({ target: { checked: !permission.canView } } as any)}></Checkbox></Tooltip>

    }, {
      title: 'UPDATE',
      dataIndex: 'canUpdate',
      key: 'canUpdate',
      render: (permission: Permission) => <Tooltip placement="topLeft" title={permission.code}>
        {permission.code}
        <Checkbox checked={permission.canUpdate} onChange={() => onChange({ target: { checked: !permission.canUpdate } } as any)}></Checkbox></Tooltip>
    }, {
      title: 'DELETE',
      dataIndex: 'canDelete',
      key: 'canDelete',
      render: (permission: Permission) => <Tooltip placement="topLeft" title={permission.code}>
        {permission.code}
        <Checkbox checked={permission.canDelete} onChange={() => onChange({ target: { checked: !permission.canDelete } } as any)}></Checkbox></Tooltip>
    }, {
      title: 'EXPORT',
      dataIndex: 'canExport',
      key: 'canExport',
      render: (permission: Permission) => <Tooltip placement="topLeft" title={permission.code}>
        {permission.code}
        <Checkbox checked={permission.canExport} onChange={() => onChange({ target: { checked: !permission.canExport } } as any)}></Checkbox></Tooltip>
    }, {
      title: 'Write',
      dataIndex: 'canWrite',
      key: 'canWrite',
      render: (permission: Permission) => <Tooltip placement="topLeft" title={permission.code}>
        {permission.code}
        <Checkbox checked={permission.canWrite} onChange={() => onChange({ target: { checked: !permission.canWrite } } as any)}></Checkbox></Tooltip>

    }
  ];
  return (
   <> 
    <div className="bg-white p-4 rounded-lg w-full height-full flex gap-2.5">
        <Select
          defaultValue={defaultValue}
          style={{ width: 400 , height: 40 }}
          onChange={(value) => handleUserSelect(value.value)}
          options={options}
        />
        <Divider type="vertical" />
        <Table<Permission>  className="flex-1" dataSource={permissions} columns={itemTableColumns} />
    </div>
      
   </>
      
  )
}
