import type { User } from "../model/User";

export type RoleType = "ADMIN" | "SALES" | "PM" | "KOC";

export const KOC_ROLE_ID = "a1000000-0000-0000-0000-000000000003";
export const ADMIN_ROLE_ID = "a1000000-0000-0000-0000-000000000001";
export const PM_ROLE_ID = "a1000000-0000-0000-0000-000000000002";
export const SALES_ROLE_ID = "a1000000-0000-0000-0000-000000000004";

/**
 * Tự động xác định Role người dùng đăng nhập từ Auth User JWT / Store
 */
export function getActiveUserRole(user: User | null): RoleType {
  if (!user) return "ADMIN"; // Mặc định khi chưa đăng nhập / guest demo

  if (user.admin || user.isAdmin) return "ADMIN";

  // Check roleId UUID
  if (user.roleId) {
    const rId = String(user.roleId);
    if (rId === ADMIN_ROLE_ID) return "ADMIN";
    if (rId === PM_ROLE_ID) return "PM";
    if (rId === KOC_ROLE_ID) return "KOC";
    if (rId === SALES_ROLE_ID) return "SALES";
  }

  // Check roles array from JWT / backend response
  const roles = (user.roles || []).map((r) => String(r).toUpperCase());
  if (roles.some((r) => r.includes("ADMIN") || r.includes("SUPER"))) return "ADMIN";
  if (roles.some((r) => r.includes("PM") || r.includes("OPERATION"))) return "PM";
  if (roles.some((r) => r.includes("SALE") || r.includes("SA"))) return "SALES";
  if (roles.some((r) => r.includes("KOC"))) return "KOC";

  // Check email fallback if username contains keywords
  const email = (user.email || "").toLowerCase();
  if (email.includes("admin")) return "ADMIN";
  if (email.includes("pm")) return "PM";
  if (email.includes("sales") || email.includes("sa@")) return "SALES";
  if (email.includes("koc")) return "KOC";

  return "ADMIN";
}

export function getRoleDisplayName(role: RoleType): string {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên (Sao Mai & Hằng)";
    case "PM":
      return "Vận hành (PM)";
    case "SALES":
      return "Sales Account";
    case "KOC":
      return "KOC Sáng tạo nội dung";
    default:
      return "Quản trị viên";
  }
}
