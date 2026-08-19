import type { Permission } from "./Permission";

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  system?: boolean;
  isSystem?: boolean;
  permissions?: Permission[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  version?: number;
  isDeleted?: boolean;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

export type RolePayload = Omit<Role, "id" | "createdAt" | "updatedAt" | "version" | "isDeleted">;
