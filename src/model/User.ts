export type User = {
  // Core identity
  id: string;
  username: string;
  email: string;
  fullName: string;

  // Roles & permissions (from backend JWT/response)
  roles: string[];
  permissions: string[]
  admin: boolean;
  isAdmin?: boolean; // alias from JWT claims

  // Status
  status: string;
  version: number;

  // Optional profile fields (may not always be returned)
  passwordHash?: string;
  zalo?: string;
  phone?: string;
  identityCard?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export type loginResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  user: User | null;
}

export type loginRequest = {
  email: string;
  password: string;
}


