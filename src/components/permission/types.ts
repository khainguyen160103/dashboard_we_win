// ─── Kiểu dữ liệu dùng chung cho màn Phân quyền ──────────────────────────────

/** Một vai trò trong hệ thống, ví dụ: Admin, PM, KOC */
export type RoleRow = {
  id: number | string;
  name: string;
  code: string;
  description: string;
};

/** Một quyền cụ thể, ví dụ: Xem chiến dịch, Duyệt video */
export type PermissionCol = {
  id: number | string;
  name: string;
  code: string;
  resource: string;
  action: string;
};

/** Một người dùng trong hệ thống */
export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  status: "Active" | "Inactive";
  /** Danh sách mã role được gán: ["ADMIN", "PM"] */
  assignedRoles: string[];
};

/** roleCode -> Set các code permission được bật */
export type RolePermissionMap = Record<string, Set<string>>;
