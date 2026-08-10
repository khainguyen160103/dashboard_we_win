import type { KOCRecord } from "../koc/types";

// ─── Campaign Status ─────────────────────────────────────────────────────────
export type CampaignStatus = "Draft" | "Active" | "Completed" | "Cancelled";

// ─── KOC Pipeline Status within a Campaign ────────────────────────────────────
export type KOCPipelineStatus =
  | "invited"        // 1. Đã gửi lời mời
  | "registered"     // 2. KOC đã đăng ký
  | "wewin_review"   // 3. WeWin đang sơ duyệt
  | "brand_review"   // 4. Đã gửi nhãn hàng duyệt
  | "approved"       // 5. Đã duyệt (chờ deal giá hoặc xác nhận)
  | "dealing"        // 6. Đang deal giá
  | "confirmed"      // 7. Xác nhận tham gia
  | "rejected"       // Bị từ chối ở bất kỳ bước nào
  | "thanked";       // Đã gửi thư cảm ơn

// ─── KOC entry inside a Campaign ──────────────────────────────────────────────
export type CampaignKOC = {
  kocId: number;
  kocName: string;
  kocEmail: string;
  kocPhone?: string;
  platform: KOCRecord["platform"];
  tier: KOCRecord["tier"];
  followers: number;
  status: KOCPipelineStatus;
  hasCast: boolean;
  /** Mức cast mong muốn (KOC đề xuất) */
  desiredCast?: number;
  /** Mức cast cuối cùng chốt */
  finalCast?: number;
  invitedAt: string;
  statusUpdatedAt: string;
  rejectReason?: string;
  /** Ghi chú deal giá / trao đổi */
  notes?: string;
};

// ─── Campaign ─────────────────────────────────────────────────────────────────
export type Campaign = {
  id: number;
  name: string;
  description?: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  category?: string;
  brandName?: string;
  kocs: CampaignKOC[];
};

// ─── Form Values ──────────────────────────────────────────────────────────────
export type CampaignFormValues = {
  name: string;
  description?: string;
  brandName?: string;
  category?: string;
  dateRange: [string, string];
  budget: number;
  status: CampaignStatus;
};

// ─── Pipeline step order (for determining valid transitions) ──────────────────
export const PIPELINE_ORDER: KOCPipelineStatus[] = [
  "invited",
  "registered",
  "wewin_review",
  "brand_review",
  "approved",
  "dealing",
  "confirmed",
  "thanked",
];

// ─── Pipeline labels ─────────────────────────────────────────────────────────
export const PIPELINE_LABELS: Record<KOCPipelineStatus, string> = {
  invited: "Đã mời",
  registered: "Đã đăng ký",
  wewin_review: "WeWin sơ duyệt",
  brand_review: "Nhãn hàng duyệt",
  approved: "Đã duyệt",
  dealing: "Đang deal giá",
  confirmed: "Xác nhận tham gia",
  rejected: "Từ chối",
  thanked: "Đã cảm ơn",
};
