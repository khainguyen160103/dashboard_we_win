/**
 * KOC trong một chiến dịch — khớp `CampaignKocDto` của campaign-service
 * (endpoint `/api/campaigns/{campaignId}/kocs`).
 */
export type CampaignKocStatus =
  | "INVITED"
  | "REGISTERED"
  | "WEWIN_REVIEW"
  | "BRAND_REVIEW"
  | "APPROVED"
  | "DEALING"
  | "CONFIRMED"
  | "REJECTED"
  | "THANKED";

export type CampaignKocDto = {
  id: string;
  campaignId: string;
  kocUserId: string;
  status: CampaignKocStatus;
  hasCast: boolean;
  desiredCast?: number | null;
  finalCast?: number | null;
  notes?: string | null;
  rejectReason?: string | null;
  invitedAt?: string;
  statusUpdatedAt?: string;
  pmUserId?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // snapshot KOC (join)
  kocName?: string;
  kocTier?: string;
  kocFollowers?: number | null;
  kocGmv?: number | null;
  kocLinkTiktok?: string | null;
  kocIdTiktok?: string | null;
  kocZalo?: string | null;
  kocTopLocation?: string | null;
  kocProductCategoryId?: string | null;
};

export type InviteKocPayload = {
  kocUserIds: string[];
  hasCast?: boolean;
  pmUserId?: string;
};

export type UpdateCampaignKocPayload = {
  status?: CampaignKocStatus;
  hasCast?: boolean;
  desiredCast?: number;
  finalCast?: number;
  notes?: string;
  rejectReason?: string;
  pmUserId?: string;
};

export const CAMPAIGN_KOC_STATUS_LABEL: Record<CampaignKocStatus, string> = {
  INVITED: "Đã mời",
  REGISTERED: "Đã đăng ký",
  WEWIN_REVIEW: "WeWin sơ duyệt",
  BRAND_REVIEW: "Nhãn hàng duyệt",
  APPROVED: "Đã duyệt",
  DEALING: "Đang deal giá",
  CONFIRMED: "Xác nhận tham gia",
  REJECTED: "Từ chối",
  THANKED: "Đã cảm ơn",
};

export const CAMPAIGN_KOC_STATUS_COLOR: Record<CampaignKocStatus, string> = {
  INVITED: "#8c8c8c",
  REGISTERED: "#13c2c2",
  WEWIN_REVIEW: "#1890ff",
  BRAND_REVIEW: "#722ed1",
  APPROVED: "#2f54eb",
  DEALING: "#fa8c16",
  CONFIRMED: "#52c41a",
  REJECTED: "#ff4d4f",
  THANKED: "#d4b106",
};

/** Trạng thái "đã tham gia thực sự" (dùng để đếm KPI). */
export const PARTICIPATING_STATUSES: CampaignKocStatus[] = ["CONFIRMED", "THANKED"];
