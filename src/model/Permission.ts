export interface Permission {
  id: number;
  code: string;
  name: string;
  resource?: string | null;
  action?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
}

// Optional: shape used when creating/updating a permission
export type PermissionPayload = Omit<Permission, "id" | "createdAt" | "updatedAt" | "version" | "isDeleted">;
