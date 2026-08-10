export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
}

// Optional: shape used when creating/updating a role
export type RolePayload = Omit<Role, "id" | "createdAt" | "updatedAt" | "version" | "isDeleted">;
