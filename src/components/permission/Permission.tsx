import { Button, Checkbox, Flex, Select, Table, message } from 'antd'
import { permissionQuery, roleQuery } from '../../hooks/query'
import { useEffect, useState, useMemo } from 'react'
import type { Permission as PermissionRow } from '../../model/Permission'

// Danh sách cột quyền: key phải trùng tên field trong API
const ACTIONS = [
  { key: 'canView', label: 'Xem' },
  { key: 'canCreate', label: 'Thêm' },
  { key: 'canUpdate', label: 'Sửa' },
  { key: 'canDelete', label: 'Xoá' },
  { key: 'canExport', label: 'Xuất Excel' },
  { key: 'canWrite', label: 'Ghi vào' },
] as const

const mergeRows = (
  allResources: PermissionRow[] = [],
  rolePermissions: PermissionRow[] = []
): PermissionRow[] => {
  // Bảng permission chứa bản ghi của nhiều role -> cùng 1 code bị lặp,
  // nên lọc trùng theo code, mỗi resource chỉ giữ 1 dòng
  const uniqueResources = Array.from(
    new Map(allResources.map((r) => [r.code, r])).values()
  )

  return uniqueResources.map((resource) => {
    // tìm quyền của role cho resource này (so theo code)
    const found = rolePermissions.find((p) => p.code === resource.code)

    return {
      ...resource,
      id: found?.id,
      canView: !!found?.canView,
      canCreate: !!found?.canCreate,
      canUpdate: !!found?.canUpdate,
      canDelete: !!found?.canDelete,
      canExport: !!found?.canExport,
      canWrite: !!found?.canWrite,
    }
  })
}

type ActionKey = (typeof ACTIONS)[number]['key']

export const Permission = () => {
  const [roleSelected, setRoleSelected] = useState<string>('')
  const [permissions, setPermissions] = useState<PermissionRow[]>([])

  const { getRoles } = roleQuery
  const { getPermissionsByRoleId, getPermissions } = permissionQuery // getPermissions: tên bạn tự đặt

  const savePermissions = permissionQuery.saveByRole()

  const { data: rolesData } = getRoles()
  const { data: allResources } = getPermissions()
  const { data: rolePermissions, isLoading: isRolePermissionsLoading } =
    getPermissionsByRoleId(roleSelected)

  // Bản gốc = danh sách đầy đủ đã ghép với quyền của role
  const baseRows = useMemo(
    () => mergeRows(allResources, rolePermissions),
    [allResources, rolePermissions]
  )

  // Khi bản gốc đổi (đổi role, load xong) thì copy vào bản chỉnh sửa
  useEffect(() => {
    setPermissions(baseRows)
  }, [baseRows])

  const roleOptions =
    rolesData?.map((role: { name: string; id: string }) => ({
      label: role.name,
      value: role.id,
    })) || []


  // Định danh dòng bằng code (không đổi giữa các role), không dùng id
  const handleChange = (code: string, field: ActionKey, checked: boolean) => {
    setPermissions((prev) =>
      prev.map((item) =>
        item.code === code ? { ...item, [field]: checked } : item
      )
    )
  }

  // Ô này có khác bản gốc (từ server) không
  const isCellChanged = (code: string, field: ActionKey) => {
    const original = baseRows.find((item) => item.code === code)
    const current = permissions.find((item) => item.code === code)
    if (!original || !current) return false
    return original[field] !== current[field]
  }

  // Các dòng đã thay đổi
  const changedRows = permissions.filter((item) =>
    ACTIONS.some((action) => isCellChanged(item.code, action.key))
  )


  const hasChanges = changedRows.length > 0

  const handleSave = async () => {
    if (!roleSelected) return

    // Gom tất cả dòng thay đổi vào 1 mảng.
    // id = id bản ghi của role này (có -> update, không có -> tạo mới)
    const payload: PermissionRow[] = changedRows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      url: row.url,
      menuUri: row.menuUri,
      objectId: row.objectId,
      canView: !!row.canView,
      canCreate: !!row.canCreate,
      canUpdate: !!row.canUpdate,
      canDelete: !!row.canDelete,
      canExport: !!row.canExport,
      canWrite: !!row.canWrite,
    }))

    try {
      // Gửi cả list trong 1 request
      await savePermissions.mutateAsync({
        roleId: roleSelected,
        permissions: payload,
      })
      message.success('Lưu phân quyền thành công')
    } catch {
      message.error('Lưu phân quyền thất bại')
    }
  }

  const handleReset = () => {
    setPermissions(baseRows)
  }
  // Tạo cột
  const columns = [
    { title: 'Module/Quyền', key: 'url', dataIndex: 'url' },
    ...ACTIONS.map((action) => ({
      title: action.label,
      key: action.key,
      render: (_: unknown, record: PermissionRow) => (
          <Checkbox
          checked={!!record[action.key]}
          onChange={(e) =>
            handleChange(record.code, action.key, e.target.checked)
          }
          />
      ),
    })),
  ]

  return (
    <div className="p-4 bg-white shadow-md rounded-2xl mx-auto max-w-(--breakpoint-2xl) md:p-6">
      <h1 className="text-2xl mb-4">Phân quyền vai trò</h1>

      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Select
          value={roleSelected || undefined}
          style={{ width: 160 }}
          placeholder="Chọn vai trò"
          options={roleOptions}
          onChange={setRoleSelected}
        />
        <Button type="primary">+ Thêm Quyền</Button>
      </Flex>

      <Table
        rowKey="code"
        dataSource={permissions}
        loading={isRolePermissionsLoading}
        columns={columns}
        pagination={false}
      />

      <Flex gap={8} align="center" style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleSave} disabled={!hasChanges}>
          Lưu
        </Button>
        <Button onClick={handleReset} disabled={!hasChanges}>
          Hoàn tác
        </Button>
        {hasChanges && <span>Có {changedRows.length} dòng thay đổi chưa lưu</span>}
      </Flex>
    </div>
  )
}