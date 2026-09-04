import type { Campaign } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deterministic pseudo-random 0..1 from a campaign id (stable demo figures). */
function seed(id: number | string): number {
  const s = String(id);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Short VND: 1_200_000_000 -> "1.2Bđ", 400_000_000 -> "400trđ". */
export function formatVndShort(n: number): string {
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${(Math.round(v * 10) / 10).toString()}Bđ`;
  }
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}trđ`;
  return `${n.toLocaleString("vi-VN")}đ`;
}

export interface CampaignMetrics {
  /** % thời gian đã trôi qua (0..100) */
  progress: number;
  /** số ngày còn lại tới endDate (âm nếu đã quá hạn) */
  daysLeft: number;
  confirmedKocs: number;
  totalKocs: number;
  /** mục tiêu KOC (demo) */
  targetKocs: number;
  kocFillRate: number;
  budgetUsed: number;
  budgetTotal: number;
  gmv: number;
  roi: number;
  /** cờ "cần chú ý": đang chạy nhưng tỷ lệ KOC xác nhận thấp so với tiến độ */
  atRisk: boolean;
}

export function getCampaignMetrics(c: Campaign, now: Date = new Date()): CampaignMetrics {
  const start = new Date(c.startDate).getTime();
  const end = new Date(c.endDate).getTime();
  const span = Math.max(end - start, DAY_MS);

  const rawProgress = ((now.getTime() - start) / span) * 100;
  const progress =
    c.status === "Completed"
      ? 100
      : Math.min(100, Math.max(0, Math.round(rawProgress)));

  const daysLeft = Math.ceil((end - now.getTime()) / DAY_MS);

  const totalKocs = c.kocs.length;
  const confirmedKocs = c.kocs.filter(
    (k) => k.status === "confirmed" || k.status === "thanked"
  ).length;
  const targetKocs = Math.max(totalKocs, Math.round(4 + seed(c.id) * 16)); // 4..20
  const kocFillRate = targetKocs ? confirmedKocs / targetKocs : 0;

  const budgetTotal = Math.round((0.3 + seed(c.id + "b") * 2) * 1_000_000_000); // ~0.3B..2.3B
  const budgetUsed = Math.round(budgetTotal * (0.2 + (progress / 100) * 0.75));
  const gmv = Math.round(budgetUsed * (2 + seed(c.id + "g") * 3)); // ROI 2x..5x
  const roi = budgetUsed ? gmv / budgetUsed : 0;

  const atRisk =
    c.status === "Active" && progress >= 10 && kocFillRate < 0.5;

  return {
    progress,
    daysLeft,
    confirmedKocs,
    totalKocs,
    targetKocs,
    kocFillRate,
    budgetUsed,
    budgetTotal,
    gmv,
    roi,
    atRisk,
  };
}

export interface CampaignRowStatus {
  label: string;
  /** màu chấm + chữ */
  color: string;
}

export function getCampaignRowStatus(
  c: Campaign,
  m: CampaignMetrics
): CampaignRowStatus {
  if (m.atRisk) return { label: "Cần chú ý", color: "#faad14" };
  switch (c.status) {
    case "Completed":
      return { label: "Hoàn thành", color: "#8c8c8c" };
    case "Draft":
      return { label: "Bản nháp", color: "#8c8c8c" };
    case "Cancelled":
      return { label: "Đã hủy", color: "#ff4d4f" };
    case "Active":
    default:
      return m.progress >= 90
        ? { label: "Sắp xong", color: "#52c41a" }
        : { label: "Đang chạy", color: "#52c41a" };
  }
}

export function formatDateVN(d: string): string {
  return new Date(d).toLocaleDateString("vi-VN");
}

export function totalDays(c: Campaign): number {
  const span = new Date(c.endDate).getTime() - new Date(c.startDate).getTime();
  return Math.max(1, Math.round(span / DAY_MS));
}

// ─── Tầng 1: charts ──────────────────────────────────────────────────────────
export interface WeeklyPoint {
  label: string;
  value: number;
}

/** GMV tích luỹ theo tuần (6 mốc), điểm cuối = m.gmv. */
export function getWeeklyGmv(c: Campaign, m: CampaignMetrics): WeeklyPoint[] {
  const weeks = 6;
  const jitter = seed(c.id + "w");
  const out: WeeklyPoint[] = [];
  let acc = 0;
  const steps: number[] = [];
  for (let i = 0; i < weeks; i++) {
    // tăng dần, có chút biến thiên
    steps.push(1 + ((i + jitter * 3) % 2) * 0.35 + i * 0.12);
  }
  const sum = steps.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weeks; i++) {
    acc += (steps[i] / sum) * m.gmv;
    out.push({ label: `Tuần ${i + 1}`, value: Math.round(acc) });
  }
  out[weeks - 1].value = m.gmv;
  return out;
}

export interface BudgetSlice {
  label: string;
  amount: number;
  color: string;
}

/** Phân bổ ngân sách đã dùng theo hạng mục (tổng = m.budgetUsed). */
export function getBudgetBreakdown(_c: Campaign, m: CampaignMetrics): BudgetSlice[] {
  const parts = [
    { label: "Phí KOC", ratio: 0.6, color: "#3b82f6" },
    { label: "Media / Boost ads", ratio: 0.25, color: "#f97316" },
    { label: "Sản xuất nội dung", ratio: 0.1, color: "#10b981" },
    { label: "Dự phòng", ratio: 0.05, color: "#f59e0b" },
  ];
  return parts.map((p) => ({
    label: p.label,
    color: p.color,
    amount: Math.round(m.budgetUsed * p.ratio),
  }));
}

// ─── Tầng 2: tiến trình 6 mốc ────────────────────────────────────────────────
export type StepState = "done" | "active" | "todo";

export interface CampaignStep {
  label: string;
  state: StepState;
  statusText: string;
}

const STEP_DEFS: { label: string; threshold: number }[] = [
  { label: "Brief duyệt", threshold: 8 },
  { label: "KOC xác nhận tham gia", threshold: 22 },
  { label: "Nội dung nháp", threshold: 42 },
  { label: "Duyệt nội dung", threshold: 62 },
  { label: "Đăng bài", threshold: 85 },
  { label: "Báo cáo kết quả", threshold: 100 },
];

export function getCampaignSteps(m: CampaignMetrics): CampaignStep[] {
  return STEP_DEFS.map((s, i) => {
    const prev = i === 0 ? 0 : STEP_DEFS[i - 1].threshold;
    let state: StepState = "todo";
    if (m.progress >= s.threshold) state = "done";
    else if (m.progress >= prev) state = "active";
    return {
      label: s.label,
      state,
      statusText:
        state === "done"
          ? "✓ Hoàn tất"
          : state === "active"
          ? "Đang thực hiện"
          : "Chưa tới",
    };
  });
}

export const STEP_COLORS: Record<StepState, string> = {
  done: "#22c55e",
  active: "#f97316",
  todo: "#e5e7eb",
};

// ─── Tầng 3: trạng thái lời mời ──────────────────────────────────────────────
export interface InviteStatus {
  label: string;
  color: string;
}

export function getInviteStatus(status: Campaign["kocs"][number]["status"]): InviteStatus {
  if (status === "confirmed" || status === "thanked")
    return { label: "Đã xác nhận", color: "#22c55e" };
  if (status === "rejected") return { label: "Từ chối", color: "#ef4444" };
  return { label: "Chờ phản hồi", color: "#f59e0b" };
}

export interface InviteStats {
  total: number;
  confirmed: number;
  pending: number;
  rejected: number;
}

export function getInviteStats(c: Campaign): InviteStats {
  const total = c.kocs.length;
  const confirmed = c.kocs.filter(
    (k) => k.status === "confirmed" || k.status === "thanked"
  ).length;
  const rejected = c.kocs.filter((k) => k.status === "rejected").length;
  return { total, confirmed, rejected, pending: total - confirmed - rejected };
}

// ─── Tầng 4: đóng góp của từng KOC ───────────────────────────────────────────
export interface KocContribution {
  kocId: number;
  name: string;
  tier: string;
  note?: string;
  statusLabel: string;
  statusColor: string;
  videosAssigned: number;
  videosSubmitted: number;
  videosApproved: number;
  gmv: number;
  commission: number;
}

export function getKocContributions(c: Campaign, m: CampaignMetrics): KocContribution[] {
  const participating = c.kocs.filter(
    (k) => k.status === "confirmed" || k.status === "thanked"
  );
  const followerSum = participating.reduce((s, k) => s + k.followers, 0) || 1;

  return c.kocs.map((k) => {
    const isIn = k.status === "confirmed" || k.status === "thanked";
    const isDone = k.status === "thanked" || m.progress >= 100;
    const assigned = isIn ? 2 + Math.round(seed(k.kocId + "v") * 1) : 0;
    const submitted = isIn ? Math.max(0, assigned - (isDone ? 0 : 1)) : 0;
    const approved = isIn ? Math.max(0, submitted - (isDone ? 0 : 1)) : 0;
    const gmv = isIn ? Math.round((k.followers / followerSum) * m.gmv) : 0;
    const commission = Math.round(gmv * 0.11);

    let statusLabel = "Chưa hoàn thành";
    let statusColor = "#9ca3af";
    if (k.status === "rejected") {
      statusLabel = "Chưa hoàn thành";
    } else if (isDone && isIn) {
      statusLabel = "Hoàn thành";
      statusColor = "#22c55e";
    } else if (isIn) {
      statusLabel = "Đang hoàn thành";
      statusColor = "#f59e0b";
    }

    return {
      kocId: k.kocId,
      name: k.kocName,
      tier: k.tier ?? "—",
      note: k.status === "rejected" ? k.rejectReason : undefined,
      statusLabel,
      statusColor,
      videosAssigned: assigned,
      videosSubmitted: submitted,
      videosApproved: approved,
      gmv,
      commission,
    };
  });
}

// ─── Tầng 5: casting & hàng mẫu ──────────────────────────────────────────────
export interface SampleRow {
  kocId: number;
  name: string;
  casting: string;
  sampleType: string;
  sentDate?: string;
  receivedDate?: string;
  receiveMethod?: string;
  statusLabel: string;
  statusColor: string;
}

const SAMPLE_TYPES = ["Hộp 10 gói", "Hộp 20 gói", "Set dùng thử", "Full size x2"];
const RECEIVE_METHODS = ["Nhận hàng ngoài", "Giao tận nơi", "Nhận tại VP"];

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS)
    .toISOString()
    .split("T")[0];
}

export function getSampleRows(c: Campaign): SampleRow[] {
  const invited = c.kocs.filter((k) => k.status !== "rejected");
  return invited.map((k, i) => {
    const r = seed(k.kocId + "s");
    const stage = Math.floor(r * 3); // 0 chưa gửi, 1 đã gửi, 2 đã nhận
    const sampleType = SAMPLE_TYPES[i % SAMPLE_TYPES.length];
    const sentDate = stage >= 1 ? addDays(c.startDate, 3 + Math.round(r * 6)) : undefined;
    const receivedDate = stage >= 2 && sentDate ? addDays(sentDate, 2 + Math.round(r * 4)) : undefined;

    let statusLabel = "Chưa gửi hàng";
    let statusColor = "#ef4444";
    if (stage === 1) {
      statusLabel = "Đã gửi — chờ KOC xác nhận nhận";
      statusColor = "#f59e0b";
    } else if (stage === 2) {
      statusLabel = "Đã nhận — nghiệm thu xong";
      statusColor = "#22c55e";
    }

    return {
      kocId: k.kocId,
      name: k.kocName,
      casting: "Đã duyệt",
      sampleType,
      sentDate,
      receivedDate,
      receiveMethod: stage >= 2 ? RECEIVE_METHODS[i % RECEIVE_METHODS.length] : undefined,
      statusLabel,
      statusColor,
    };
  });
}

export interface SampleStats {
  needSend: number;
  sent: number;
  received: number;
  notSent: number;
}

export function getSampleStats(rows: SampleRow[]): SampleStats {
  return {
    needSend: rows.length,
    sent: rows.filter((r) => r.statusLabel !== "Chưa gửi hàng").length,
    received: rows.filter((r) => r.statusColor === "#22c55e").length,
    notSent: rows.filter((r) => r.statusLabel === "Chưa gửi hàng").length,
  };
}

// ─── Tầng 1: video đã duyệt (tổng hợp) ───────────────────────────────────────
export interface VideoAgg {
  assigned: number;
  submitted: number;
  approved: number;
}

export function getVideoAggregate(rows: KocContribution[]): VideoAgg {
  return rows.reduce(
    (a, r) => ({
      assigned: a.assigned + r.videosAssigned,
      submitted: a.submitted + r.videosSubmitted,
      approved: a.approved + r.videosApproved,
    }),
    { assigned: 0, submitted: 0, approved: 0 }
  );
}
