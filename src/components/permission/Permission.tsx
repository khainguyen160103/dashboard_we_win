import { Button, Flex, Input, Select, Table } from 'antd'
import { roleQuery } from '../../hooks/query';
import { useState } from 'react';


export const Permission = () => { 
    const [roleSelected, setRoleSelected] = useState<string | null>(null);
    const { getRoles } = roleQuery;
    const { data: rolesData, isLoading, isFetching } = getRoles();
    const roleOptions = rolesData?.map((role: { name: string; id: string }) => ({
        label: role.name,
        value: role.id,
      })) || [];

      const handleRoleChange = (value: string) => {
        console.log(`Selected role ID: ${value}`);
        setRoleSelected(value);
      }
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
          <Table  />
    
    </div>
  )
}
