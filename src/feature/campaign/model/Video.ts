/**
 * Video KOC nộp cho chiến dịch — khớp `VideoDto` của campaign-service (`/api/videos`).
 * Luồng: KOC nộp → WeWin duyệt sơ bộ → Brand duyệt → Đã duyệt (hoặc Yêu cầu sửa / Từ chối).
 */
export type VideoStatus =
  | "WEWIN_REVIEW"
  | "BRAND_REVIEW"
  | "REVISION"
  | "APPROVED"
  | "REJECTED";

export type VideoDto = {
  id: string;
  campaignId: string;
  kocUserId?: string | null;
  nameVideo?: string | null;
  status: VideoStatus | string;
  link?: string | null;
  rating?: string | null;
  timeUpload?: string | null;
  pmUserId?: string | null;
  brandUserId?: string | null;
  approveBy?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type VideoRequest = Omit<VideoDto, "id" | "createdAt" | "updatedAt">;

export type VideoListParams = {
  campaignId?: string;
  kocUserId?: string;
  status?: string;
};

export const VIDEO_STATUS_META: Record<VideoStatus, { label: string; color: string }> = {
  WEWIN_REVIEW: { label: "Chờ WeWin duyệt", color: "gold" },
  BRAND_REVIEW: { label: "Chờ Brand duyệt", color: "blue" },
  REVISION: { label: "Yêu cầu sửa", color: "orange" },
  APPROVED: { label: "Đã duyệt", color: "green" },
  REJECTED: { label: "Từ chối", color: "red" },
};

export const videoStatusMeta = (s?: string | null) =>
  VIDEO_STATUS_META[s as VideoStatus] ?? { label: s || "—", color: "default" };
