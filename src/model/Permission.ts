export interface Permission {
  id: string | number;
  code: string;
  name: string;
  resource?: string | null;
  action?: string | null;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  version?: number;
  isDeleted?: boolean;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

export type PermissionPayload = Omit<Permission, "id" | "createdAt" | "updatedAt" | "version" | "isDeleted">;
