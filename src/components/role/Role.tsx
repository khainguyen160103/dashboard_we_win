import { Button, Flex, Input } from 'antd'
import { RoleTable } from './RoleTable'
import { roleQuery } from '../../hooks/query';

export const Role = () => {

  const { getRoles } = roleQuery;
  const {data: rolesData, isLoading, isFetching } = getRoles();
  return (
    <div className="bg-white p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 shadow-md rounded-2xl">
    <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
      <Input.Search
        placeholder="Tìm kiếm vai trò..."
        style={{ width: 400 }}
        
        
        allowClear
      />
      <Button
        type="primary"
        // onClick={handleOpenAdd}

      >
        + Thêm vai trò
      </Button>
    </Flex> 
    <RoleTable roles={rolesData || []} />
    </div>

  )
}


