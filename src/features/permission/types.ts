// ─── Kiểu dữ liệu ────────────────────────────────────────────────────────────

/** Một vai trò trong hệ thống, ví dụ: Admin, PM, KOC */
export type RoleRow = {
  id: number;
  name: string;
  code: string;
  description: string;
};

/** Một quyền cụ thể, ví dụ: Xem chiến dịch, Duyệt video */
export type PermissionCol = {
  id: number;
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

// ─── Map: roleCode -> Set<permissionCode> ─────────────────────────────────────
/** Lưu trữ quyền của từng role.
 *  Key = code của Role, Value = Set các code permission được bật */
export type RolePermissionMap = Record<string, Set<string>>;

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockRoles: RoleRow[] = [
  { id: 1, name: "Quản trị viên", code: "SUPER_ADMIN", description: "Toàn quyền hệ thống" },
  { id: 2, name: "PM / Vận hành", code: "OPERATION",   description: "Quản lý chiến dịch & duyệt video" },
  { id: 3, name: "Sales Account", code: "SALES",        description: "Nhân viên kinh doanh" },
  { id: 4, name: "KOC",          code: "KOC",           description: "Người sáng tạo nội dung" },
];

export const mockPermissions: PermissionCol[] = [
  { id: 1,  name: "Xem Dashboard",       code: "DASHBOARD_VIEW",  resource: "dashboard",  action: "read" },
  { id: 2,  name: "Xem Chiến dịch",      code: "CAMPAIGN_VIEW",   resource: "campaign",   action: "read" },
  { id: 3,  name: "Sửa Chiến dịch",      code: "CAMPAIGN_EDIT",   resource: "campaign",   action: "write" },
  { id: 4,  name: "Xóa Chiến dịch",      code: "CAMPAIGN_DELETE", resource: "campaign",   action: "delete" },
  { id: 5,  name: "Xem Job & Video",      code: "JOB_VIEW",        resource: "job",        action: "read" },
  { id: 6,  name: "Duyệt Video",          code: "JOB_APPROVE",     resource: "job",        action: "approve" },
  { id: 7,  name: "Nộp Video (KOC)",      code: "JOB_SUBMIT",      resource: "job",        action: "submit" },
  { id: 8,  name: "Xem Báo cáo",         code: "REPORT_VIEW",     resource: "report",     action: "read" },
  { id: 9,  name: "Quản lý Người dùng",  code: "USER_MANAGE",     resource: "user",       action: "write" },
  { id: 10, name: "Quản lý Phân quyền",  code: "ROLE_MANAGE",     resource: "role",       action: "write" },
];

/** Ma trận quyền mặc định: roleCode -> danh sách permissionCode được bật */
export const mockRolePermissionMap: RolePermissionMap = {
  SUPER_ADMIN: new Set(mockPermissions.map((p) => p.code)), // Có tất cả quyền
  OPERATION:   new Set(["DASHBOARD_VIEW", "CAMPAIGN_VIEW", "CAMPAIGN_EDIT", "JOB_VIEW", "JOB_APPROVE", "REPORT_VIEW"]),
  SALES:       new Set(["DASHBOARD_VIEW", "CAMPAIGN_VIEW", "REPORT_VIEW"]),
  KOC:         new Set(["DASHBOARD_VIEW", "CAMPAIGN_VIEW", "JOB_VIEW", "JOB_SUBMIT"]),
};

export const mockUsers: UserRow[] = [
  { id: "u1", fullName: "Nguyễn Văn Khải",  email: "khai@wewin.vn",   status: "Active",   assignedRoles: ["SUPER_ADMIN"] },
  { id: "u2", fullName: "Trần Thị Lan",      email: "lan@wewin.vn",    status: "Active",   assignedRoles: ["OPERATION"] },
  { id: "u3", fullName: "Lê Minh Tâm",       email: "tam@wewin.vn",    status: "Active",   assignedRoles: ["SALES"] },
  { id: "u4", fullName: "Linh Barbie",        email: "linhbarbie@koc.vn", status: "Active", assignedRoles: ["KOC"] },
  { id: "u5", fullName: "Khoa Pug",           email: "khoapug@koc.vn",  status: "Active",   assignedRoles: ["KOC"] },
  { id: "u6", fullName: "Nguyễn Huy Hùng",   email: "hung@wewin.vn",   status: "Inactive", assignedRoles: [] },
];
