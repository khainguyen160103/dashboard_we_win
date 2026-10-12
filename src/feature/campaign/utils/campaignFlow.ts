/**
 * Luồng 5 bước của 1 chiến dịch (chốt họp 17/09/2026) — port từ artifact "WEWIN Dashboard Demo":
 *   Mời → Đăng ký → Sơ duyệt (Wewin) → Brand duyệt Final → Wewin xác nhận cuối ("Xác nhận & Triển khai").
 *
 * Mapping sang `CampaignKocStatus` của backend:
 *   INVITED           = đã mời, chưa đăng ký
 *   REGISTERED        = đã đăng ký — Sơ duyệt "Chờ duyệt"
 *   WEWIN_REVIEW      = Sơ duyệt "Cân nhắc"
 *   BRAND_REVIEW      = Sơ duyệt "Duyệt" → đang chờ Brand duyệt
 *   APPROVED          = Brand duyệt Final → chờ Wewin gửi thư chúc mừng (Bước 5 "Chưa gửi thư")
 *   DEALING           = đã gửi thư — chờ KOC phản hồi
 *   CONFIRMED/THANKED = KOC đã xác nhận cuối → chính thức tham gia
 *   REJECTED          = loại / từ chối (rejectReason gắn tiền tố bước để phân biệt)
 *
 * Trường chỉ Wewin thao tác mà BE chưa có (GMV check, đội NV Vận hành, phân công) lưu ở
 * `useCampaignFlowStore` (localStorage) — khi BE bổ sung cột thì thay store bằng API.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CampaignKocDto, CampaignKocStatus } from "../model/CampaignKoc";
import { sourceMeta, type FormSubmission } from "../model/InviteForm";
import type { VideoDto } from "../model/Video";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "Hôm nay" của app. */
export const appNow = (): Date => new Date();

export const fmtVNDate = (d?: string | Date | null): string => {
  if (!d) return "—";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "—";
  return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}/${x.getFullYear()}`;
};

export const fmtVND = (n?: number | null): string => {
  if (n == null || Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 2).replace(/\.?0+$/, "")}B₫`;
  if (Math.abs(n) >= 1e6) return `${Math.round(n / 1e6)}M₫`;
  return `${new Intl.NumberFormat("vi-VN").format(n)}₫`;
};

export const fmtVNDFull = (n?: number | null) =>
  n == null ? "—" : `${new Intl.NumberFormat("vi-VN").format(Math.round(n))} đ`;

export const fmtNum = (n?: number | null) => (n == null ? "—" : new Intl.NumberFormat("vi-VN").format(n));

export type Tone = "good" | "warn" | "crit" | "muted";

// ─── Nhóm trạng thái ──────────────────────────────────────────────────────────

const has = (s: CampaignKocStatus, ...list: CampaignKocStatus[]) => list.includes(s);

export const STEP5_REJECT_PREFIX = "[Xác nhận cuối] ";
export const SCREEN_REJECT_PREFIX = "[Sơ duyệt] ";

/** Đã nhận lời mời (artifact: roster.status === "confirmed"). */
export const isRegistered = (r: CampaignKocDto) =>
  has(r.status, "REGISTERED", "WEWIN_REVIEW", "BRAND_REVIEW", "APPROVED", "DEALING", "CONFIRMED", "THANKED") ||
  (r.status === "REJECTED" && Boolean(r.rejectReason?.startsWith(STEP5_REJECT_PREFIX)));

export const isDeclined = (r: CampaignKocDto) => r.status === "REJECTED" && !isRegistered(r);

/** Chính thức tham gia = đã hoàn tất Bước 5 (artifact isFinalConfirmedKoc). */
export const isFinalConfirmed = (r: CampaignKocDto) => has(r.status, "CONFIRMED", "THANKED");

// ─── Kênh nguồn đăng ký ───────────────────────────────────────────────────────

/** "dashboard" = mời trực tiếp từ dashboard (không qua form); còn lại = nguồn link form (`?src=`: facebook, zalo, direct...). */
export type KenhNguon = string;

export const kenhNguonMeta = (key: KenhNguon): { label: string; color: string } =>
  key === "dashboard" ? { label: "Dashboard", color: "blue" } : sourceMeta(key);

// ─── Store cho các trường BE chưa có ─────────────────────────────────────────

export type GmvCheck = "matched" | "pending" | "mismatch";
export type Screening = "pending" | "approve" | "reject" | "consider";

type FlowStore = {
  gmvCheck: Record<string, GmvCheck>;
  /** Ngày gửi thư chúc mừng (Bước 5), key = campaignId|kocUserId. */
  letterSentAt: Record<string, string>;
  opsTeam: Record<string, string[]>;
  opsOverride: Record<string, string>;
  setGmvCheck: (key: string, v: GmvCheck) => void;
  setLetterSent: (key: string, at: string) => void;
  setOpsTeam: (campaignId: string, team: string[]) => void;
  setOpsOverride: (key: string, staff: string) => void;
};

export const useCampaignFlowStore = create<FlowStore>()(
  persist(
    (set) => ({
      gmvCheck: {},
      letterSentAt: {},
      opsTeam: {},
      opsOverride: {},
      setGmvCheck: (key, v) => set((s) => ({ gmvCheck: { ...s.gmvCheck, [key]: v } })),
      setLetterSent: (key, at) => set((s) => ({ letterSentAt: { ...s.letterSentAt, [key]: at } })),
      setOpsTeam: (campaignId, team) => set((s) => ({ opsTeam: { ...s.opsTeam, [campaignId]: team } })),
      setOpsOverride: (key, staff) => set((s) => ({ opsOverride: { ...s.opsOverride, [key]: staff } })),
    }),
    { name: "wewin-campaign-flow" },
  ),
);

export const flowKey = (r: CampaignKocDto) => `${r.campaignId}|${r.kocUserId}`;

// ─── Danh sách KOC Đăng ký (Sơ duyệt) ─────────────────────────────────────────

export const REGISTER_SCREEN_META: Record<Screening, { label: string; tone: Tone }> = {
  pending: { label: "Chờ duyệt", tone: "muted" },
  approve: { label: "Duyệt", tone: "good" },
  reject: { label: "Loại", tone: "crit" },
  consider: { label: "Cân nhắc", tone: "warn" },
};

export const GMV_CHECK_META: Record<GmvCheck, { label: string; tone: Tone }> = {
  matched: { label: "Đã đối chiếu — khớp", tone: "good" },
  pending: { label: "Chưa đối chiếu", tone: "muted" },
  mismatch: { label: "Chênh lệch nhẹ — cần hỏi lại KOC", tone: "crit" },
};

export const screeningOf = (r: CampaignKocDto): Screening => {
  if (r.status === "REGISTERED") return "pending";
  if (r.status === "WEWIN_REVIEW") return "consider";
  if (r.status === "REJECTED" && !r.rejectReason?.startsWith(STEP5_REJECT_PREFIX)) return "reject";
  return "approve";
};

/** Trạng thái BE tương ứng khi Wewin chọn 1 lựa chọn Sơ duyệt. */
export const SCREENING_TO_STATUS: Record<Screening, CampaignKocStatus> = {
  pending: "REGISTERED",
  consider: "WEWIN_REVIEW",
  approve: "BRAND_REVIEW",
  reject: "REJECTED",
};

/** Đơn đăng ký — dữ liệu thật: câu trả lời form mời nếu có, không thì snapshot KOC; thiếu = null ("—"). */
export type Registration = {
  row: CampaignKocDto;
  /** ISO — thời điểm gửi form, hoặc lúc chuyển trạng thái nếu không qua form. */
  submittedAt: string | null;
  zalo: string | null;
  fullName: string;
  kenhNguon: KenhNguon;
  channelLink: string | null;
  channelId: string | null;
  followers: number | null;
  gmv30: number | null;
  email: string | null;
  address: string | null;
  customAnswers: Record<string, unknown>;
  screening: Screening;
  note: string;
};

const str = (v: unknown) => (v == null || v === "" ? null : String(v));
const num = (v: unknown) => (v == null || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

/** Dựng "đơn đăng ký" từ KOC đã qua bước Mời (status khác INVITED / PENDING_INVITE). */
export const buildRegistrations = (rows: CampaignKocDto[], submissions: FormSubmission[] = []): Registration[] => {
  const byKoc = new Map(submissions.map((s) => [s.kocUserId, s]));
  return rows
    .filter((r) => r.status !== "INVITED" && r.status !== "PENDING_INVITE")
    .map((r) => {
      const sub = byKoc.get(r.kocUserId);
      const f = sub?.fixedAnswers ?? {};
      return {
        row: r,
        submittedAt: sub?.submittedAt ?? r.statusUpdatedAt ?? null,
        zalo: str(f.zalo) ?? str(r.kocZalo),
        fullName: str(f.fullname) ?? r.kocName ?? r.kocUserId,
        kenhNguon: sub ? sub.source || "direct" : "dashboard",
        channelLink: str(f.linkTiktok) ?? str(r.kocLinkTiktok),
        channelId: str(f.idTiktok) ?? str(r.kocIdTiktok),
        followers: num(f.follower) ?? num(r.kocFollowers),
        gmv30: num(f.gmv30) ?? num(r.kocGmv),
        email: str(f.email),
        address: str(f.address),
        customAnswers: sub?.customAnswers ?? {},
        screening: screeningOf(r),
        note: (r.rejectReason ?? "").replace(SCREEN_REJECT_PREFIX, "").replace(STEP5_REJECT_PREFIX, ""),
      };
    });
};

// ─── Brand duyệt & Xác nhận & Triển khai (Bước 5) ────────────────────────────

export const brandDecisionMeta = (r: CampaignKocDto): { label: string; tone: Tone } =>
  has(r.status, "APPROVED", "DEALING", "CONFIRMED", "THANKED") || r.rejectReason?.startsWith(STEP5_REJECT_PREFIX)
    ? { label: "Duyệt Final", tone: "good" }
    : r.status === "REJECTED"
      ? { label: "Loại", tone: "crit" }
      : { label: "Chờ Duyệt", tone: "muted" };

export type ConfirmStatus = "chua_gui" | "da_gui_thu" | "da_xac_nhan" | "tu_choi";

export const CONFIRM_DEPLOY_META: Record<ConfirmStatus, { label: string; tone: Tone }> = {
  chua_gui: { label: "Chưa gửi thư", tone: "muted" },
  da_gui_thu: { label: "Đã gửi — chờ phản hồi", tone: "warn" },
  da_xac_nhan: { label: "Đã xác nhận", tone: "good" },
  tu_choi: { label: "Từ chối", tone: "crit" },
};

/** Đã qua Sơ duyệt = Duyệt VÀ Brand duyệt = Final (artifact confirmDeployEligibleRoster). */
export const confirmDeployEligible = (rows: CampaignKocDto[]) =>
  rows.filter(
    (r) =>
      has(r.status, "APPROVED", "DEALING", "CONFIRMED", "THANKED") ||
      (r.status === "REJECTED" && Boolean(r.rejectReason?.startsWith(STEP5_REJECT_PREFIX))),
  );

export const confirmStatusOf = (r: CampaignKocDto): ConfirmStatus =>
  r.status === "APPROVED"
    ? "chua_gui"
    : r.status === "DEALING"
      ? "da_gui_thu"
      : r.status === "REJECTED"
        ? "tu_choi"
        : "da_xac_nhan";

/** Ngày gửi thư / ngày xác nhận — chỉ hiển thị dữ liệu đã lưu (store gửi thư + statusUpdatedAt của BE). */
export const confirmDatesOf = (
  _campaign: { name: string; startTime?: string | Date | null },
  r: CampaignKocDto,
  letterSentAt?: string,
) => {
  const status = confirmStatusOf(r);
  if (status === "chua_gui") return { sent: "—", confirmed: "—" };
  if (status === "da_gui_thu") return { sent: fmtVNDate(letterSentAt ?? r.statusUpdatedAt), confirmed: "—" };
  return { sent: fmtVNDate(letterSentAt), confirmed: fmtVNDate(r.statusUpdatedAt) };
};

export const CONFIRM_DEPLOY_TEMPLATES = [
  {
    id: "zalo_congrats",
    channel: "zalo" as const,
    label: "Zalo — Thư chúc mừng & xác nhận triển khai",
    subject: "",
    body:
      'Chúc mừng {{koc_name}} 🎉\n\nBạn đã chính thức được duyệt tham gia chiến dịch "{{campaign_name}}" cùng nhãn hàng {{brand}}!\nWEWIN sẽ tiến hành gửi hàng mẫu & lên lịch triển khai ngay sau khi bạn xác nhận lại tin nhắn này.\nPM phụ trách: {{pm_name}}.\n\nCảm ơn bạn đã đồng hành cùng WEWIN!',
  },
  {
    id: "email_congrats",
    channel: "email" as const,
    label: "Email — Thư chúc mừng & xác nhận triển khai",
    subject: "[WEWIN] Chúc mừng bạn đã được duyệt tham gia chiến dịch {{campaign_name}}",
    body:
      'Kính gửi {{koc_name}},\n\nWEWIN trân trọng thông báo bạn đã chính thức được duyệt tham gia chiến dịch "{{campaign_name}}" cùng nhãn hàng {{brand}}.\nVui lòng phản hồi email này để xác nhận, WEWIN sẽ tiến hành gửi hàng mẫu & lên lịch triển khai ngay sau đó. PM phụ trách: {{pm_name}}.\n\nTrân trọng,\nĐội ngũ WEWIN',
  },
];

export const resolveConfirmTemplate = (
  str: string,
  ctx: { campaignName: string; brand: string; kocName: string; pmName: string },
) =>
  str
    .replace(/\{\{campaign_name\}\}/g, ctx.campaignName)
    .replace(/\{\{brand\}\}/g, ctx.brand)
    .replace(/\{\{koc_name\}\}/g, ctx.kocName)
    .replace(/\{\{pm_name\}\}/g, ctx.pmName);

// ─── Hàng mẫu (dùng chung với "Nhãn hàng gửi hàng mẫu cho KOC") ──────────────

export const sampleReceived = (r: CampaignKocDto) => r.status === "THANKED";

// ─── Tiến trình chiến dịch — 6 mốc (artifact buildTimeline) ──────────────────

export type TimelineStep = { label: string; state: "done" | "current" | "upcoming"; note: string };

export type VideoCounts = { assigned: number; submitted: number; approved: number };

/** Đếm video thật của chiến dịch (GET /api/videos?campaignId=). */
export const videoCountsOf = (videos: VideoDto[]): VideoCounts => {
  const submitted = videos.filter((v) => v.status !== "REJECTED");
  return {
    assigned: submitted.length,
    submitted: submitted.length,
    approved: submitted.filter((v) => v.status === "APPROVED").length,
  };
};

export const buildTimeline = (rows: CampaignKocDto[], kpiTarget: number, video: VideoCounts): TimelineStep[] => {
  const invited = rows.length;
  const registered = rows.filter(isRegistered).length;
  const cancelled = rows.filter(isDeclined).length;
  const eligible = confirmDeployEligible(rows);
  const m3Processed =
    eligible.length > 0 && eligible.every((r) => ["da_xac_nhan", "tu_choi"].includes(confirmStatusOf(r)));
  const confirmedFinalCount = eligible.filter((r) => confirmStatusOf(r) === "da_xac_nhan").length;
  const finalConfirmedTotal = rows.filter(isFinalConfirmed).length;
  const sampleConfirmed = rows.filter((r) => isFinalConfirmed(r) && sampleReceived(r)).length;

  const steps = [
    { label: "Mời KOC", done: invited >= kpiTarget, note: `${invited}/${kpiTarget} đã mời` },
    {
      label: "KOC đăng ký",
      done: invited > 0 && registered + cancelled === invited,
      note: `${registered}/${invited} đã đăng ký`,
    },
    {
      label: "Xác nhận & Triển khai",
      done: m3Processed,
      note: `${confirmedFinalCount}/${eligible.length} đã xác nhận cuối`,
    },
    {
      label: "KOC tham gia",
      done: m3Processed && finalConfirmedTotal > 0,
      note: `${finalConfirmedTotal}/${kpiTarget} chính thức tham gia`,
    },
    {
      label: "Gửi hàng mẫu",
      done: finalConfirmedTotal > 0 && sampleConfirmed === finalConfirmedTotal,
      note: `${sampleConfirmed}/${finalConfirmedTotal} đã nhận hàng mẫu`,
    },
    {
      label: "Duyệt Video",
      done: video.assigned > 0 && video.approved === video.assigned,
      note: `${video.approved}/${video.assigned} video đã duyệt`,
    },
  ];
  // 1 khi gặp bước đầu tiên chưa xong, mọi bước phía sau khoá về "Chưa tới" — phễu tuần tự.
  let blocked = false;
  return steps.map((s) => {
    let state: TimelineStep["state"];
    if (blocked) state = "upcoming";
    else if (s.done) state = "done";
    else {
      state = "current";
      blocked = true;
    }
    return { label: s.label, state, note: s.note };
  });
};

// ─── Đội Nhân sự Vận hành phụ trách chiến dịch ───────────────────────────────

/** NV Vận hành được phân công cho KOC — chỉ khi PM đã chọn (lưu ở store), không tự gán. */
export const opsStaffOf = (team: string[], override?: string) =>
  override && team.includes(override) ? override : undefined;

// ─── Cờ "Cần chú ý" (artifact isAtRisk) ──────────────────────────────────────

export const AVG_ROI_SYSTEM = 4.2;

export const isAtRisk = (opts: { completed: boolean; roi?: number | null; confirmed: number; total: number; progress: number }) =>
  !opts.completed &&
  ((opts.roi != null && opts.roi < 0.7 * AVG_ROI_SYSTEM) ||
    (opts.total > 0 && opts.confirmed / opts.total < 0.5 && opts.progress > 30));
