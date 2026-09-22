import { Button, Checkbox, Flex, Select, Table } from 'antd'
import { permissionQuery, roleQuery } from '../../hooks/query';
import { useState } from 'react';




export const Permission = () => { 

  const [roleSelected, setRoleSelected] = useState<string>("");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const { getRoles } = roleQuery;
  const { getPermissionsByRoleId, getPermissions } = permissionQuery


  const { data } = getPermissionsByRoleId(roleSelected)
  const { data: permissions, isLoading: isPermissionLoading } = getPermissions()


  const { data: rolesData } = getRoles();
    const roleOptions = rolesData?.map((role: { name: string; id: string }) => ({
        label: role.name,
        value: role.id,
      })) || [];

      const handleRoleChange = (value: string) => {

        setRoleSelected(value);
      }


  const handleToggle = (id: string, checked: boolean) => {
    setCheckedIds(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };
  const column =
    [
      { title: 'Module/Quyền', dataIndex: 'name', key: 'name' },
      {
        title: 'Xem', dataIndex: 'canView', key: 'description', render: (_, record) => (
          <Checkbox
            checked={checkedIds.includes(record.id)}
            onChange={(e) => handleToggle(record.id, e.target.checked)}
          />
        )
      },
      {
        title: 'Thêm', dataIndex: 'canCreate', key: 'description', render: (_, record) => (
          <Checkbox
            checked={checkedIds.includes(record.id)}
            onChange={(e) => handleToggle(record.id, e.target.checked)}
          />
        )
      },
      {
        title: 'Sửa', dataIndex: 'canUpdate', key: 'description', render: (_, record) => (
          <Checkbox
            checked={checkedIds.includes(record.id)}
            onChange={(e) => handleToggle(record.id, e.target.checked)}
          />
        )
      },
      {
        title: 'Xoá', dataIndex: 'canDelete', key: 'description', render: (_, record) => (
          <Checkbox
            checked={checkedIds.includes(record.id)}
            onChange={(e) => handleToggle(record.id, e.target.checked)}
          />
        )
      },
      {
        title: 'Xuất Excel', dataIndex: 'canExport', key: 'description', render: (_, record) => (
          <Checkbox
            checked={checkedIds.includes(record.id)}
            onChange={(e) => handleToggle(record.id, e.target.checked)}
          />
        )
      },
      {
        title: 'Ghi vào', dataIndex: 'canWrite', key: 'description', render: (_, record) => (
          <Checkbox
            checked={checkedIds.includes(record.id)}
            onChange={(e) => handleToggle(record.id, e.target.checked)}
          />
        )
      },

    ]


  return (
    <div className="p-4 bg-white shadow-md rounded-2xl mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <h1 className="text-2xl mb-4">Phân quyền vai trò</h1>
          <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
              <Select style={{ width: 120 }} placeholder="Chọn vai trò" className="mb-4" options={roleOptions} onChange={handleRoleChange} />
              <Button
                  type="primary"
                //   onClick={handleOpenAdd}

              >
                + Thêm Quyền
              </Button>
          </Flex> 
      <Table
        rowKey="id"
        dataSource={permissions}
        loading={isPermissionLoading}
        columns={column}
      />
    
    </div>
  )
}
