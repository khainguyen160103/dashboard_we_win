export type Permission = {
  id?: number;
  name: string;
  code: string;
  url?: string;
  canView?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canWrite?: boolean;
  objectId?: number;
  menuUri?: string;
  roleId?: string;
};

type Action = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canWrite: boolean;
};

export type PermissionMap = Record<string, Action>;

export type PermissionPayload = Omit<
  Permission,
  "id" | "createdAt" | "updatedAt" | "version" | "isDeleted"
>;

export type PermissionFlags = {
  canView: boolean;
  canWrite: boolean;
  canCreate: boolean;
  canRemove: boolean;
  canExport: boolean;
};

export type PermissionGroup = {
  [key: string]: PermissionFlags;
};
