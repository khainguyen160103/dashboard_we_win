import type { CampaignStatus, KOCPipelineStatus } from "../model/types";

// ─── Campaign status colors ──────────────────────────────────────────────────
export const getCampaignStatusColor = (status: CampaignStatus): string => {
  switch (status) {
    case "ACTIVE":    return "success";
    case "DRAFT":     return "default";
    case "COMPLETED": return "blue";
    case "CANCELLED": return "error";
    default:          return "default";
  }
};

export const getCampaignStatusLabel = (status: CampaignStatus): string => {
  switch (status) {
    case "ACTIVE":    return "Đang chạy";
    case "DRAFT":     return "Bản nháp";
    case "COMPLETED": return "Hoàn thành";
    case "CANCELLED": return "Đã hủy";
    default:          return status;
  }
};

// ─── KOC Pipeline status colors ──────────────────────────────────────────────
export const getPipelineStatusColor = (status: KOCPipelineStatus): string => {
  switch (status) {
    case "invited":      return "default";
    case "registered":   return "cyan";
    case "wewin_review": return "processing";
    case "brand_review": return "purple";
    case "approved":     return "geekblue";
    case "dealing":      return "orange";
    case "confirmed":    return "success";
    case "rejected":     return "error";
    case "thanked":      return "gold";
    default:             return "default";
  }
};

// ─── Category options ────────────────────────────────────────────────────────
export const CATEGORY_OPTIONS = [
  { value: "Beauty",  label: "Beauty" },
  { value: "Fashion", label: "Fashion" },
  { value: "Tech",    label: "Tech" },
  { value: "F&B",     label: "F&B" },
  { value: "Travel",  label: "Travel" },
  { value: "Health",  label: "Health" },
  { value: "Other",   label: "Khác" },
];

// ─── Format currency (VND) ──────────────────────────────────────────────────
export const formatVND = (n: number): string =>
  n.toLocaleString("vi-VN") + " ₫";
