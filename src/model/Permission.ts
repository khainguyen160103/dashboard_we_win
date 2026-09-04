export interface Permission {
  id?: number;
  name: string;
  code: string;
  /** e.g. USER, ROLE, DASHBOARD */
  resource?: string;
  /** e.g. CREATE, READ, UPDATE, DELETE */
  action?: string;
  url?: string;
  canView?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canWrite?: boolean;
  objectId?: number;
  menuUri?: string;
}

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
