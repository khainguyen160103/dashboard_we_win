// Barrel export — import tất cả từ đây
export { RolePermissionMatrix } from "./RolePermissionMatrix";
export { AddRoleModal }         from "./AddRoleModal";
export { AddPermissionModal }   from "./AddPermissionModal";
export { AssignRoleModal }      from "./AssignRoleModal";
export { UserRoleTable }        from "./UserRoleTable";

export type { RoleRow, PermissionCol, UserRow, RolePermissionMap } from "./types";

export {
  mockRoles,
  mockPermissions,
  mockRolePermissionMap,
  mockUsers,
} from "./types";
