export type User = {
  // Core identity
  id: string;
  username?: string;
  email: string;
  fullName: string;
  roleId?: string;

  // Roles & permissions (from backend JWT/response)
  roles?: string[];
  permissions?: string[];
  admin?: boolean;
  isAdmin?: boolean; // alias from JWT claims

  // Status
  status: string;
  version?: number;

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
};

export type UserRequest = {
  email: string;
  roleId: string;
  status: string;
  fullName: string;
};

export type loginResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
};

export type loginRequest = {
  email: string;
  password: string;
};

export type Koc = {
  id: string;
  name: string;
  /** Chỉ dùng khi tạo mới KOC (BE tạo tài khoản user role KOC). */
  email?: string;
  bankAccount: string;
  typeBank: string;
  revenue: number;
  averageSellingPrice: number;
  engagementRate: number;
  livestreamTotalAmount: number;
  videoTotalAmount: number;
  viewer: number;
  linkTiktok: string;
  facebook: string;
  zalo: string;
  gmvPerCustomer: number;
  gmvByProduct: number;
  gmvPerSaleChanel: number;
  followerFemale: number;
  followerMale: number;
  followerAge: number;
  topLocation: string;
  address: string;
  ageOfChildren: string;
  idTiktok: string;
  kocType: string;
  tier: string;
  gmv: number;
  followers: number;
  status: string;
  productCategory: string;
};