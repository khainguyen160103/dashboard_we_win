import type { CampaignKocDto } from "../../model/CampaignKoc";
import { PARTICIPATING_STATUSES } from "../../model/CampaignKoc";

// ─── Derived KPIs for the "Danh sách mời KOC" views ──────────────────────────
export type CampaignKocStats = {
  /** Tổng số KOC đã được mời vào chiến dịch */
  total: number;
  /** Đã xác nhận tham gia (CONFIRMED + THANKED) */
  confirmed: number;
  /** Bị từ chối */
  rejected: number;
  /** Đang trong pipeline (mời / đăng ký / duyệt / deal) */
  inProgress: number;
  /** Tổng tiền cast đã chốt (Σ finalCast) */
  totalCast: number;
};

export function getCampaignKocStats(rows: CampaignKocDto[]): CampaignKocStats {
  const total = rows.length;
  const confirmed = rows.filter((r) => PARTICIPATING_STATUSES.includes(r.status)).length;
  const rejected = rows.filter((r) => r.status === "REJECTED").length;

  return {
    total,
    confirmed,
    rejected,
    inProgress: Math.max(0, total - confirmed - rejected),
    totalCast: rows.reduce((sum, r) => sum + (r.finalCast ?? 0), 0),
  };
}

/** "228trđ" — gọn cho các cột tiền trong bảng. */
export function formatVndShort(n?: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷđ`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}trđ`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}kđ`;
  return `${n}đ`;
}
