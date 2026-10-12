// ─── Utilities ────────────────────────────────────────────────────────────────
export const INDUSTRY_COLORS: Record<string, string> = {
  "Beauty & Skincare": "magenta",
  "F&B": "orange",
  "Fashion & Lifestyle": "purple",
  Technology: "blue",
  Healthcare: "green",
  FMCG: "cyan",
  "Travel & Tourism": "geekblue",
  Education: "gold",
  Automotive: "volcano",
  Other: "default",
};

export const TIER_COLORS: Record<string, string> = {
  Gold: "#faad14",
  Silver: "#8c8c8c",
  Bronze: "#d46b08",
  New: "#52c41a",
};

export const STATUS_COLORS: Record<string, string> = {
  Active: "success",
  Inactive: "error",
  Pending: "warning",
};

export const STATUS_LABELS: Record<string, string> = {
  Active: "Đang hoạt động",
  Inactive: "Ngừng hoạt động",
  Pending: "Chờ xác nhận",
};

/** Bảng màu cho donut "Phân bổ theo Ngành hàng" (taxonomy TikTok Shop). */
export const INDUSTRY_VN_COLORS: Record<string, string> = {
  "Điện thoại & Đồ điện tử": "#3b82f6",
  "Đồ ăn & Đồ uống": "#f97316",
  "Chăm sóc sắc đẹp & Chăm sóc cá nhân": "#22c55e",
  "Trang phục nữ & Đồ lót": "#eab308",
  "Phụ kiện thời trang": "#ec4899",
  "Sức khỏe": "#14b8a6",
  "Thể thao & Ngoài trời": "#8b5cf6",
};

export function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}tr`;
  return amount.toLocaleString("vi-VN");
}

/** "21Bđ" · "3.6Bđ" · "720trđ" — dùng ở dashboard Quản lý Brand. */
export function formatVndD(amount: number): string {
  if (amount >= 1_000_000_000) {
    const v = amount / 1_000_000_000;
    // >= 10 tỷ: làm tròn số nguyên; nhỏ hơn: giữ 1 chữ số thập phân
    return `${v >= 10 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)}Bđ`;
  }
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}trđ`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}kđ`;
  return `${amount}đ`;
}
