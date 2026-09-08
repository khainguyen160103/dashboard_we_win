/**
 * Job & Duyệt Video — mock data + helper thuần, port 1:1 từ bản demo HTML "WEWIN Dashboard Demo".
 *
 * 1 Job = 1 KOC làm cho 1 chiến dịch. MỖI KOC làm 2 video (Video 1 & Video 2) — mỗi video có
 * luồng riêng, tối đa 2 vòng chỉnh sửa trước "DUYỆT FINAL", sau đó tới giai đoạn lên sóng (air)
 * + code ads. Trạng thái Job cấp Kanban suy ra từ trạng thái của video1 + video2 (không lưu tay).
 */

export type Tone = "neutral" | "warn" | "good" | "crit";

// ── Trạng thái từng vòng Video ──────────────────────────────────────────────
export type VideoSubState =
  | "awaiting_demo"
  | "review_r1"
  | "revise_r1"
  | "review_r2"
  | "revise_r2"
  | "brand_review"
  | "final"
  | "air_live"
  | "rejected";

export const VIDEO_SUBSTATES: Record<
  VideoSubState,
  { label: string; short: string; tone: Tone }
> = {
  awaiting_demo: { label: "Chưa nộp demo", short: "Chưa nộp", tone: "neutral" },
  review_r1: { label: "Đã nộp demo — chờ WeWin duyệt sơ bộ (vòng 1)", short: "Chờ duyệt V1", tone: "warn" },
  revise_r1: { label: "Yêu cầu sửa vòng 1 — chờ KOC nộp lại", short: "Cần sửa V1", tone: "crit" },
  review_r2: { label: "Đã nộp bản sửa — chờ WeWin duyệt sơ bộ (vòng 2)", short: "Chờ duyệt V2", tone: "warn" },
  revise_r2: {
    label: "Vòng 2 chưa đạt — hết lượt sửa, chờ Ops quyết định",
    short: "Hết lượt sửa",
    tone: "crit",
  },
  brand_review: {
    label: "Đã qua WeWin duyệt sơ bộ — chờ Brand duyệt chính thức",
    short: "Chờ Brand duyệt",
    tone: "warn",
  },
  final: { label: "DUYỆT FINAL — chờ lên sóng", short: "Final", tone: "good" },
  air_live: { label: "Đã lên sóng (air)", short: "Đã air", tone: "good" },
  rejected: { label: "Từ chối hẳn — không đạt sau tối đa 2 lần sửa", short: "Từ chối", tone: "crit" },
};

export const subStateMeta = (k: string) =>
  VIDEO_SUBSTATES[k as VideoSubState] ?? VIDEO_SUBSTATES.awaiting_demo;

// ── Trạng thái Job cấp Kanban (4 cột) — suy ra từ video1 + video2 ──────────
export type JobStageKey = "producing" | "reviewing" | "final_air" | "rejected";

export const JOB_STAGES: {
  key: JobStageKey;
  label: string;
  short: string;
  tone: Tone;
  slaHours: number | null;
}[] = [
  { key: "producing", label: "Đang sản xuất demo", short: "Đang sản xuất", tone: "neutral", slaHours: null },
  { key: "reviewing", label: "Đang duyệt / chờ chỉnh sửa", short: "Đang duyệt", tone: "warn", slaHours: 24 },
  { key: "final_air", label: "Đã duyệt FINAL — lên sóng", short: "Hoàn tất", tone: "good", slaHours: 48 },
  { key: "rejected", label: "Từ chối hẳn / KOC huỷ job", short: "Từ chối/Huỷ", tone: "crit", slaHours: null },
];

export const jobStageMeta = (key: JobStageKey) => JOB_STAGES.find((s) => s.key === key)!;

const REVIEW_SUBSTATES: VideoSubState[] = [
  "review_r1",
  "revise_r1",
  "review_r2",
  "revise_r2",
  "brand_review",
];

// ── Types dữ liệu ─────────────────────────────────────────────────────────────
export type VideoSlot = {
  status: VideoSubState;
  demo1Date?: string;
  finalDate?: string;
  round1Note?: string;
  demo2Date?: string;
  round2Note?: string;
  airDate?: string;
  airLink?: string;
  adsCode?: string;
  rejectedBy?: "brand" | "ops";
  rejectionReason?: string;
  // ── Nhúng phát video ────────────────────────────────────────────────────────
  // PRODUCTION: chỉ cần `driveFileId` (file phải share "Bất kỳ ai có đường liên kết").
  //   Player nhúng: https://drive.google.com/file/d/<driveFileId>/preview
  // DEMO: `videoUrl` là link video mp4 công khai để phát ngay trong web mà không cần Drive.
  //   Player ưu tiên `videoUrl` nếu có, ngược lại dùng iframe Drive `/preview`.
  driveFileId?: string;
  videoUrl?: string;
};

export type VideoJob = {
  id: string;
  koc: string;
  campaign: string;
  driveFolder: string;
  pm?: string | null;
  hoursInStage: number;
  cancelled?: boolean;
  cancelledBy?: "koc";
  cancelReason?: string;
  video1: VideoSlot;
  video2: VideoSlot;
};

export function computeJobStage(job: VideoJob): JobStageKey {
  if (job.cancelled) return "rejected";
  const s1 = job.video1.status;
  const s2 = job.video2.status;
  if (s1 === "rejected" || s2 === "rejected") return "rejected";
  if (REVIEW_SUBSTATES.includes(s1) || REVIEW_SUBSTATES.includes(s2)) return "reviewing";
  const done = (st: VideoSubState) => st === "final" || st === "air_live";
  if (done(s1) && done(s2)) return "final_air";
  return "producing";
}

export function jobOverdue(job: VideoJob, stageKey: JobStageKey) {
  const meta = jobStageMeta(stageKey);
  return meta.slaHours != null && job.hoursInStage > meta.slaHours;
}

// ── Quy mô toàn hệ thống (dùng khi filter = "Tất cả chiến dịch") ─────────────
export const JOB_SYSTEM_COUNTS: Record<JobStageKey, number> = {
  producing: 34,
  reviewing: 52,
  final_air: 189,
  rejected: 12,
};
export const jobSystemTotal = Object.values(JOB_SYSTEM_COUNTS).reduce((s, n) => s + n, 0);

export const PM_STATS = [
  { name: "Lan Anh", approved: 145, rejected: 18, sla: 12.3 },
  { name: "Minh Khoa", approved: 130, rejected: 15, sla: 15.8 },
  { name: "Thu Trang", approved: 105, rejected: 12, sla: 16.1 },
];

/** Precheck cấp hệ thống (Tầng 1) — 3 mảng chưa có module quản lý riêng trên dashboard */
export const PRECHECK_SYSTEM = {
  pendingCasting: 14,
  waitingSample: 9,
  cancelled: 23,
};

// Chiến dịch → Nhãn hàng (để lọc theo Brand ở Cổng Brand)
export const CAMPAIGN_BRAND: Record<string, string> = {
  "Biti's Hunter X Street": "Biti's Hunter",
  "Galaxy Launch Z": "Samsung Vietnam",
  "Galaxy Buds Mới Ra Mắt": "Samsung Vietnam",
  "Samsung Tết 2027 Sớm": "Samsung Vietnam",
  "OMO Đánh Bay Vết Bẩn": "Unilever",
  "Sunsilk Phục Hồi Tóc Hư Tổn": "Unilever",
  "Comfort - Mùa hè 2026": "Unilever",
  "Kem Chống Nắng Anthelios": "La Roche-Posay",
  "Highlands Trung Thu 2026": "Highlands Coffee",
  "Vietjet Bay Khắp Việt Nam": "Vietjet Air",
  "Khuyến mãi tháng 8": "Cocoon Vietnam",
  "TH Trà Sữa Ít Đường": "TH True Milk",
};
export const brandOfCampaign = (campaign: string) => CAMPAIGN_BRAND[campaign] ?? "—";

// Video mp4 công khai ổn định (Google GTV samples) — chỉ dùng để phát demo.
const SAMPLE = (f: string) =>
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${f}`;

// ── Job demo (nhiều chiến dịch, mỗi chiến dịch vài KOC) ─────────────────────
export const VIDEO_JOBS: VideoJob[] = [
  // ═══ Biti's Hunter X Street ═══
  {
    id: "j1",
    koc: "Ngọc Diễm Fashion",
    campaign: "Biti's Hunter X Street",
    driveFolder: "drive.wewin.vn/bitis-street/ngocdiem",
    pm: "Minh Khoa",
    hoursInStage: 0,
    video1: {
      status: "air_live",
      demo1Date: "12/08/2026",
      finalDate: "14/08/2026",
      airDate: "15/08/2026",
      airLink: "tiktok.com/@ngocdiem.fashion/video/7412000000001",
      adsCode: "TT-ADS-88213",
      driveFileId: "1BitisNgocDiemV1a2Z9KpQ2mBv7nR4tYuLwE",
      videoUrl: SAMPLE("BigBuckBunny.mp4"),
    },
    video2: {
      status: "air_live",
      demo1Date: "16/08/2026",
      finalDate: "18/08/2026",
      airDate: "19/08/2026",
      airLink: "tiktok.com/@ngocdiem.fashion/video/7412000000002",
      adsCode: "TT-ADS-88214",
      driveFileId: "1BitisNgocDiemV2b3H7uJ4kM0sD3fGh6JkPq",
      videoUrl: SAMPLE("ElephantsDream.mp4"),
    },
  },
  {
    id: "j2",
    koc: "Anh Tú Fitness",
    campaign: "Biti's Hunter X Street",
    driveFolder: "drive.wewin.vn/bitis-street/anhtu",
    pm: "Minh Khoa",
    hoursInStage: 26,
    video1: {
      status: "final",
      demo1Date: "14/08/2026",
      finalDate: "17/08/2026",
      videoUrl: SAMPLE("ForBiggerBlazes.mp4"),
      driveFileId: "1BitisAnhTuV1kFrN9pQ2mBv7nR4tYuLwEsD3",
    },
    video2: {
      status: "final",
      demo1Date: "18/08/2026",
      finalDate: "20/08/2026",
      videoUrl: SAMPLE("ForBiggerEscapes.mp4"),
    },
  },
  {
    id: "j3",
    koc: "Bảo Trân Lifestyle",
    campaign: "Biti's Hunter X Street",
    driveFolder: "drive.wewin.vn/bitis-street/baotran",
    pm: "Lan Anh",
    hoursInStage: 8,
    video1: {
      status: "air_live",
      demo1Date: "11/08/2026",
      finalDate: "13/08/2026",
      airDate: "14/08/2026",
      airLink: "tiktok.com/@baotran.lifestyle/video/7411000000010",
      adsCode: "TT-ADS-88090",
      videoUrl: SAMPLE("ForBiggerFun.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "19/08/2026",
      finalDate: "21/08/2026",
      videoUrl: SAMPLE("ForBiggerJoyrides.mp4"),
    },
  },
  {
    id: "j4",
    koc: "Quốc Bảo Men Style",
    campaign: "Biti's Hunter X Street",
    driveFolder: "drive.wewin.vn/bitis-street/quocbao",
    pm: "Minh Khoa",
    hoursInStage: 7,
    // KOC đã nộp — WeWin duyệt sơ bộ xong, đang chờ Brand duyệt chính thức
    video1: {
      status: "brand_review",
      demo1Date: "22/08/2026",
      videoUrl: SAMPLE("ForBiggerMeltdowns.mp4"),
      driveFileId: "1BitisQuocBaoV1review9pQ2mBv7nR4tYuLw",
    },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j5",
    koc: "Ngọc Ánh Outfit Daily",
    campaign: "Biti's Hunter X Street",
    driveFolder: "drive.wewin.vn/bitis-street/ngocanh",
    pm: "Lan Anh",
    hoursInStage: 31,
    video1: {
      status: "revise_r1",
      demo1Date: "21/08/2026",
      round1Note: "Chưa có cảnh mang giày đi lại thực tế theo brief — bổ sung 5s cận cảnh đế giày.",
    },
    video2: { status: "awaiting_demo" },
  },

  // ═══ Galaxy Launch Z ═══
  {
    id: "j6",
    koc: "Bảo Trân Lifestyle",
    campaign: "Galaxy Launch Z",
    driveFolder: "drive.wewin.vn/galaxy-launch-z/baotran",
    pm: "Minh Khoa",
    hoursInStage: 40,
    video1: {
      status: "air_live",
      demo1Date: "10/08/2026",
      finalDate: "12/08/2026",
      airDate: "13/08/2026",
      airLink: "tiktok.com/@baotran.lifestyle/video/7409000000001",
      adsCode: "TT-ADS-77105",
      videoUrl: SAMPLE("Sintel.mp4"),
      driveFileId: "1GalaxyZBaoTranV1x1Rhq0PBXjw4tavj8Y7c",
    },
    video2: {
      status: "final",
      demo1Date: "20/08/2026",
      finalDate: "22/08/2026",
      videoUrl: SAMPLE("SubaruOutbackOnStreetAndDirt.mp4"),
    },
  },
  {
    id: "j7",
    koc: "Minh Anh Beauty",
    campaign: "Galaxy Launch Z",
    driveFolder: "drive.wewin.vn/galaxy-launch-z/minhanh",
    pm: "Minh Khoa",
    hoursInStage: 12,
    video1: {
      status: "air_live",
      demo1Date: "09/08/2026",
      finalDate: "11/08/2026",
      airDate: "12/08/2026",
      airLink: "tiktok.com/@minhanh.beauty/video/7408000000005",
      adsCode: "TT-ADS-77001",
      videoUrl: SAMPLE("TearsOfSteel.mp4"),
    },
    video2: {
      status: "air_live",
      demo1Date: "13/08/2026",
      finalDate: "15/08/2026",
      airDate: "16/08/2026",
      airLink: "tiktok.com/@minhanh.beauty/video/7408000000006",
      adsCode: "TT-ADS-77002",
      videoUrl: SAMPLE("VolkswagenGTIReview.mp4"),
    },
  },
  {
    id: "j8",
    koc: "Đức Anh Tech Review",
    campaign: "Galaxy Launch Z",
    driveFolder: "drive.wewin.vn/galaxy-launch-z/ducanh",
    pm: "Lan Anh",
    hoursInStage: 18,
    video1: {
      status: "final",
      demo1Date: "17/08/2026",
      finalDate: "19/08/2026",
      videoUrl: SAMPLE("WeAreGoingOnBullrun.mp4"),
    },
    // chờ Brand duyệt
    video2: {
      status: "brand_review",
      demo1Date: "24/08/2026",
      videoUrl: SAMPLE("WhatCarCanYouGetForAGrand.mp4"),
      driveFileId: "1GalaxyZDucAnhV2reviewaBcDeFgHiJkLmNo",
    },
  },
  {
    id: "j9",
    koc: "Kim Chi Food Review",
    campaign: "Galaxy Launch Z",
    driveFolder: "drive.wewin.vn/galaxy-launch-z/kimchi",
    pm: "Thu Trang",
    hoursInStage: 5,
    video1: { status: "awaiting_demo" },
    video2: { status: "awaiting_demo" },
  },

  // ═══ Galaxy Buds Mới Ra Mắt ═══
  {
    id: "j10",
    koc: "Quang Huy Gadget",
    campaign: "Galaxy Buds Mới Ra Mắt",
    driveFolder: "drive.wewin.vn/galaxy-buds/quanghuy",
    pm: "Lan Anh",
    hoursInStage: 10,
    video1: { status: "awaiting_demo" },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j11",
    koc: "Hà My Gadget",
    campaign: "Galaxy Buds Mới Ra Mắt",
    driveFolder: "drive.wewin.vn/galaxy-buds/hamy",
    pm: "Lan Anh",
    hoursInStage: 9,
    // chờ Brand duyệt
    video1: {
      status: "brand_review",
      demo1Date: "23/08/2026",
      videoUrl: SAMPLE("BigBuckBunny.mp4"),
      driveFileId: "1BudsHaMyV1reviewc8kFrN0aBcDeFgHiJkLm",
    },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j12",
    koc: "Đức Anh Tech Review",
    campaign: "Galaxy Buds Mới Ra Mắt",
    driveFolder: "drive.wewin.vn/galaxy-buds/ducanh",
    pm: "Minh Khoa",
    hoursInStage: 22,
    video1: {
      status: "final",
      demo1Date: "18/08/2026",
      finalDate: "20/08/2026",
      videoUrl: SAMPLE("WhatCarCanYouGetForAGrand.mp4"),
      driveFileId: "1BudsDucAnhV1c8kFrN0aBcDeFgHiJkLmNoPq",
    },
    video2: {
      status: "final",
      demo1Date: "21/08/2026",
      finalDate: "23/08/2026",
      videoUrl: SAMPLE("BigBuckBunny.mp4"),
    },
  },
  {
    id: "j13",
    koc: "Nhật Minh Skincare",
    campaign: "Galaxy Buds Mới Ra Mắt",
    driveFolder: "drive.wewin.vn/galaxy-buds/nhatminh",
    pm: "Minh Khoa",
    hoursInStage: 46,
    video1: {
      status: "revise_r2",
      demo1Date: "16/08/2026",
      round1Note: "Chưa test thử tính năng chống ồn theo brief.",
      demo2Date: "20/08/2026",
      round2Note:
        "Đoạn so sánh chống ồn còn mờ, tiếng nền lớn — đây là lần sửa cuối theo quy định.",
    },
    video2: { status: "awaiting_demo" },
  },

  // ═══ OMO Đánh Bay Vết Bẩn ═══
  {
    id: "j14",
    koc: "Hoài Thương Mom&Baby",
    campaign: "OMO Đánh Bay Vết Bẩn",
    driveFolder: "drive.wewin.vn/omo/hoaithuong",
    pm: "Lan Anh",
    hoursInStage: 29,
    video1: {
      status: "revise_r1",
      demo1Date: "22/08/2026",
      round1Note:
        "Chưa nêu rõ công dụng sản phẩm theo brief, thiếu CTA cuối video — quay lại đoạn kết.",
    },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j15",
    koc: "Thảo My Daily",
    campaign: "OMO Đánh Bay Vết Bẩn",
    driveFolder: "drive.wewin.vn/omo/thaomy",
    pm: "Lan Anh",
    hoursInStage: 20,
    video1: {
      status: "final",
      demo1Date: "17/08/2026",
      finalDate: "19/08/2026",
      videoUrl: SAMPLE("ElephantsDream.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "20/08/2026",
      finalDate: "22/08/2026",
      videoUrl: SAMPLE("ForBiggerBlazes.mp4"),
    },
  },
  {
    id: "j16",
    koc: "Kim Chi Food Review",
    campaign: "OMO Đánh Bay Vết Bẩn",
    driveFolder: "drive.wewin.vn/omo/kimchi",
    pm: "Thu Trang",
    hoursInStage: 4,
    video1: { status: "review_r2", demo1Date: "18/08/2026", demo2Date: "23/08/2026" },
    video2: { status: "awaiting_demo" },
  },

  // ═══ Sunsilk Phục Hồi Tóc Hư Tổn ═══
  {
    id: "j17",
    koc: "Minh Anh Beauty",
    campaign: "Sunsilk Phục Hồi Tóc Hư Tổn",
    driveFolder: "drive.wewin.vn/sunsilk/minhanh",
    pm: "Minh Khoa",
    hoursInStage: 12,
    video1: {
      status: "final",
      demo1Date: "19/08/2026",
      finalDate: "21/08/2026",
      videoUrl: SAMPLE("ForBiggerEscapes.mp4"),
    },
    // chờ Brand duyệt
    video2: {
      status: "brand_review",
      demo1Date: "24/08/2026",
      videoUrl: SAMPLE("ForBiggerJoyrides.mp4"),
      driveFileId: "1SunsilkMinhAnhV2reviewkFrN0aBcDeFgHi",
    },
  },
  {
    id: "j18",
    koc: "Gia Hân Skincare",
    campaign: "Sunsilk Phục Hồi Tóc Hư Tổn",
    driveFolder: "drive.wewin.vn/sunsilk/giahan",
    pm: "Thu Trang",
    hoursInStage: 15,
    video1: {
      status: "air_live",
      demo1Date: "15/08/2026",
      finalDate: "17/08/2026",
      airDate: "18/08/2026",
      airLink: "tiktok.com/@giahan.skincare/video/7413000000021",
      adsCode: "TT-ADS-88301",
      videoUrl: SAMPLE("ForBiggerFun.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "19/08/2026",
      finalDate: "22/08/2026",
      videoUrl: SAMPLE("ForBiggerJoyrides.mp4"),
    },
  },
  {
    id: "j19",
    koc: "Bảo Trân Lifestyle",
    campaign: "Sunsilk Phục Hồi Tóc Hư Tổn",
    driveFolder: "drive.wewin.vn/sunsilk/baotran",
    pm: "Lan Anh",
    hoursInStage: 6,
    video1: { status: "awaiting_demo" },
    video2: { status: "awaiting_demo" },
  },

  // ═══ Highlands Trung Thu 2026 ═══
  {
    id: "j20",
    koc: "Kim Chi Food Review",
    campaign: "Highlands Trung Thu 2026",
    driveFolder: "drive.wewin.vn/highlands-trungthu/kimchi",
    pm: "Thu Trang",
    hoursInStage: 60,
    video1: {
      status: "final",
      demo1Date: "14/08/2026",
      finalDate: "16/08/2026",
      videoUrl: SAMPLE("Sintel.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "17/08/2026",
      finalDate: "19/08/2026",
      videoUrl: SAMPLE("SubaruOutbackOnStreetAndDirt.mp4"),
    },
  },
  {
    id: "j21",
    koc: "Đức Anh Tech Review",
    campaign: "Highlands Trung Thu 2026",
    driveFolder: "drive.wewin.vn/highlands-trungthu/ducanh",
    pm: "Minh Khoa",
    hoursInStage: 17,
    video1: {
      status: "final",
      demo1Date: "18/08/2026",
      finalDate: "20/08/2026",
      videoUrl: SAMPLE("TearsOfSteel.mp4"),
    },
    // chờ Brand duyệt
    video2: {
      status: "brand_review",
      demo1Date: "24/08/2026",
      videoUrl: SAMPLE("VolkswagenGTIReview.mp4"),
      driveFileId: "1HighlandsDucAnhV2reviewN0aBcDeFgHiJk",
    },
  },
  {
    id: "j22",
    koc: "Bảo Trân Lifestyle",
    campaign: "Highlands Trung Thu 2026",
    driveFolder: "drive.wewin.vn/highlands-trungthu/baotran",
    pm: "Lan Anh",
    hoursInStage: 33,
    video1: {
      status: "air_live",
      demo1Date: "13/08/2026",
      finalDate: "15/08/2026",
      airDate: "16/08/2026",
      airLink: "tiktok.com/@baotran.lifestyle/video/7410000000030",
      adsCode: "TT-ADS-88120",
      videoUrl: SAMPLE("VolkswagenGTIReview.mp4"),
    },
    video2: {
      status: "air_live",
      demo1Date: "17/08/2026",
      finalDate: "19/08/2026",
      airDate: "20/08/2026",
      airLink: "tiktok.com/@baotran.lifestyle/video/7410000000031",
      adsCode: "TT-ADS-88121",
      videoUrl: SAMPLE("WeAreGoingOnBullrun.mp4"),
    },
  },

  // ═══ Kem Chống Nắng Anthelios ═══
  {
    id: "j23",
    koc: "Gia Hân Skincare",
    campaign: "Kem Chống Nắng Anthelios",
    driveFolder: "drive.wewin.vn/anthelios/giahan",
    pm: "Thu Trang",
    hoursInStage: 30,
    video1: {
      status: "final",
      demo1Date: "18/08/2026",
      finalDate: "20/08/2026",
      videoUrl: SAMPLE("WhatCarCanYouGetForAGrand.mp4"),
    },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j24",
    koc: "Minh Anh Beauty",
    campaign: "Kem Chống Nắng Anthelios",
    driveFolder: "drive.wewin.vn/anthelios/minhanh",
    pm: "Thu Trang",
    hoursInStage: 21,
    video1: {
      status: "air_live",
      demo1Date: "12/08/2026",
      finalDate: "14/08/2026",
      airDate: "15/08/2026",
      airLink: "tiktok.com/@minhanh.beauty/video/7409000000040",
      adsCode: "TT-ADS-88055",
      videoUrl: SAMPLE("BigBuckBunny.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "16/08/2026",
      finalDate: "18/08/2026",
      videoUrl: SAMPLE("ElephantsDream.mp4"),
    },
  },

  // ═══ Vietjet Bay Khắp Việt Nam ═══
  {
    id: "j25",
    koc: "Bảo Trân Lifestyle",
    campaign: "Vietjet Bay Khắp Việt Nam",
    driveFolder: "drive.wewin.vn/vietjet/baotran",
    pm: "Minh Khoa",
    hoursInStage: 6,
    // chờ Brand duyệt
    video1: {
      status: "brand_review",
      demo1Date: "24/08/2026",
      videoUrl: SAMPLE("ForBiggerBlazes.mp4"),
      driveFileId: "1VietjetBaoTranV1reviewaBcDeFgHiJkLmN",
    },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j26",
    koc: "Anh Tú Fitness",
    campaign: "Vietjet Bay Khắp Việt Nam",
    driveFolder: "drive.wewin.vn/vietjet/anhtu",
    pm: "Minh Khoa",
    hoursInStage: 25,
    video1: {
      status: "final",
      demo1Date: "17/08/2026",
      finalDate: "19/08/2026",
      videoUrl: SAMPLE("ForBiggerBlazes.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "20/08/2026",
      finalDate: "22/08/2026",
      videoUrl: SAMPLE("ForBiggerEscapes.mp4"),
    },
  },

  // ═══ Samsung Tết 2027 Sớm ═══
  {
    id: "j27",
    koc: "Đức Anh Tech Review",
    campaign: "Samsung Tết 2027 Sớm",
    driveFolder: "drive.wewin.vn/samsung-tet/ducanh",
    pm: "Lan Anh",
    hoursInStage: 50,
    video1: {
      status: "final",
      demo1Date: "15/08/2026",
      finalDate: "17/08/2026",
      videoUrl: SAMPLE("ForBiggerFun.mp4"),
    },
    video2: {
      status: "revise_r2",
      demo1Date: "18/08/2026",
      round1Note: "Thiếu cảnh mở hộp sản phẩm — bổ sung đoạn đầu video.",
      demo2Date: "21/08/2026",
      round2Note:
        "Vẫn chưa thấy rõ logo sản phẩm trong khung hình chính — đây là lần sửa cuối theo quy định, nếu vòng tới không đạt sẽ dừng job.",
    },
  },
  {
    id: "j28",
    koc: "Quang Huy Gadget",
    campaign: "Samsung Tết 2027 Sớm",
    driveFolder: "drive.wewin.vn/samsung-tet/quanghuy",
    pm: "Minh Khoa",
    hoursInStage: 8,
    video1: { status: "awaiting_demo" },
    video2: { status: "awaiting_demo" },
  },

  // ═══ Comfort - Mùa hè 2026 ═══
  {
    id: "j29",
    koc: "Minh Anh Beauty",
    campaign: "Comfort - Mùa hè 2026",
    driveFolder: "drive.wewin.vn/comfort-he/minhanh",
    pm: "Lan Anh",
    hoursInStage: 14,
    video1: {
      status: "air_live",
      demo1Date: "10/08/2026",
      finalDate: "12/08/2026",
      airDate: "13/08/2026",
      airLink: "tiktok.com/@minhanh.beauty/video/7407000000050",
      adsCode: "TT-ADS-77500",
      videoUrl: SAMPLE("ForBiggerJoyrides.mp4"),
    },
    video2: {
      status: "air_live",
      demo1Date: "14/08/2026",
      finalDate: "16/08/2026",
      airDate: "17/08/2026",
      airLink: "tiktok.com/@minhanh.beauty/video/7407000000051",
      adsCode: "TT-ADS-77501",
      videoUrl: SAMPLE("Sintel.mp4"),
    },
  },
  {
    id: "j30",
    koc: "Gia Hân Skincare",
    campaign: "Comfort - Mùa hè 2026",
    driveFolder: "drive.wewin.vn/comfort-he/giahan",
    pm: "Thu Trang",
    hoursInStage: 19,
    video1: {
      status: "final",
      demo1Date: "16/08/2026",
      finalDate: "18/08/2026",
      videoUrl: SAMPLE("SubaruOutbackOnStreetAndDirt.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "19/08/2026",
      finalDate: "21/08/2026",
      videoUrl: SAMPLE("TearsOfSteel.mp4"),
    },
  },
  {
    id: "j31",
    koc: "Thảo My Daily",
    campaign: "Comfort - Mùa hè 2026",
    driveFolder: "drive.wewin.vn/comfort-he/thaomy",
    pm: "Lan Anh",
    hoursInStage: 7,
    // chờ Brand duyệt
    video1: {
      status: "brand_review",
      demo1Date: "24/08/2026",
      videoUrl: SAMPLE("ForBiggerEscapes.mp4"),
      driveFileId: "1ComfortThaoMyV1reviewaBcDeFgHiJkLmNo",
    },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j32",
    koc: "Hoài Thương Mom&Baby",
    campaign: "Comfort - Mùa hè 2026",
    driveFolder: "drive.wewin.vn/comfort-he/hoaithuong",
    pm: "Lan Anh",
    hoursInStage: 34,
    video1: {
      status: "revise_r1",
      demo1Date: "20/08/2026",
      round1Note: "Mùi hương là điểm nhấn chính nhưng chưa có phân cảnh cảm nhận hương — bổ sung.",
    },
    video2: { status: "awaiting_demo" },
  },

  // ═══ Khuyến mãi tháng 8 (huỷ) ═══
  {
    id: "j33",
    koc: "Thảo My Daily",
    campaign: "Khuyến mãi tháng 8",
    driveFolder: "drive.wewin.vn/km-thang8/thaomy",
    pm: null,
    hoursInStage: 0,
    cancelled: true,
    cancelledBy: "koc",
    cancelReason:
      'KOC yêu cầu phí cast 200k trước khi nhận hàng mẫu, không đạt được thoả thuận với nhãn hàng — dừng hợp tác, chưa phát sinh video nào (đúng theo mẫu lý do trong tab DS HUỶ của Sheet vận hành thật, VD: "Cast 200k").',
    video1: { status: "awaiting_demo" },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j34",
    koc: "Ngọc Diễm Fashion",
    campaign: "Khuyến mãi tháng 8",
    driveFolder: "drive.wewin.vn/km-thang8/ngocdiem",
    pm: null,
    hoursInStage: 0,
    cancelled: true,
    cancelledBy: "koc",
    cancelReason: "KOC bận lịch chiến dịch khác, xin huỷ job trước khi nhận hàng mẫu.",
    video1: { status: "awaiting_demo" },
    video2: { status: "awaiting_demo" },
  },

  // ═══ TH Trà Sữa Ít Đường (1 job từ chối hẳn + 1 hoàn tất) ═══
  {
    id: "j35",
    koc: "Anh Tú Fitness",
    campaign: "TH Trà Sữa Ít Đường",
    driveFolder: "drive.wewin.vn/th-trasua/anhtu",
    pm: "Minh Khoa",
    hoursInStage: 0,
    video1: {
      status: "rejected",
      demo1Date: "17/08/2026",
      round1Note: "Góc quay chưa làm nổi bật bao bì sản phẩm mới — quay lại cận cảnh hơn.",
      demo2Date: "19/08/2026",
      round2Note:
        "Vẫn chưa đạt yêu cầu Brand về góc quay sản phẩm — đã dùng hết 2 lần sửa theo quy định.",
      rejectedBy: "brand",
      rejectionReason:
        "Sau 2 lần sửa vẫn chưa làm nổi bật bao bì sản phẩm theo yêu cầu Brand — dừng job, không tiếp tục quay lại.",
    },
    video2: { status: "awaiting_demo" },
  },
  {
    id: "j36",
    koc: "Kim Chi Food Review",
    campaign: "TH Trà Sữa Ít Đường",
    driveFolder: "drive.wewin.vn/th-trasua/kimchi",
    pm: "Thu Trang",
    hoursInStage: 28,
    video1: {
      status: "final",
      demo1Date: "16/08/2026",
      finalDate: "18/08/2026",
      videoUrl: SAMPLE("VolkswagenGTIReview.mp4"),
    },
    video2: {
      status: "final",
      demo1Date: "19/08/2026",
      finalDate: "21/08/2026",
      videoUrl: SAMPLE("WeAreGoingOnBullrun.mp4"),
    },
  },
];

export const VIDEO_CAMPAIGNS = [...new Set(VIDEO_JOBS.map((v) => v.campaign))].sort((a, b) =>
  a.localeCompare(b, "vi"),
);

export const VIDEO_BRANDS = [...new Set(Object.values(CAMPAIGN_BRAND))].sort((a, b) =>
  a.localeCompare(b, "vi"),
);

export const KOC_NAMES = [...new Set(VIDEO_JOBS.map((v) => v.koc))].sort((a, b) =>
  a.localeCompare(b, "vi"),
);

export function videoStageCountsFor(campaignFilter: string): Record<JobStageKey, number> {
  if (!campaignFilter) return { ...JOB_SYSTEM_COUNTS };
  const counts: Record<JobStageKey, number> = {
    producing: 0,
    reviewing: 0,
    final_air: 0,
    rejected: 0,
  };
  VIDEO_JOBS.filter((v) => v.campaign === campaignFilter).forEach((v) => {
    counts[computeJobStage(v)]++;
  });
  return counts;
}

// ── Brand duyệt / yêu cầu sửa 1 slot video (thuần, trả về slot mới) ─────────
const fmtToday = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export function brandDecideSlot(
  slot: VideoSlot,
  decision: "approve" | "revise",
  reason?: string,
): VideoSlot {
  if (decision === "approve") {
    return { ...slot, status: "final", finalDate: fmtToday() };
  }
  // Yêu cầu sửa: quay lại đúng vòng sửa (đã sang vòng 2 thì ghi note vòng 2).
  const inRound2 = Boolean(slot.demo2Date);
  return inRound2
    ? {
        ...slot,
        status: "revise_r2",
        round2Note: reason || "Brand yêu cầu chỉnh sửa video.",
      }
    : {
        ...slot,
        status: "revise_r1",
        round1Note: reason || "Brand yêu cầu chỉnh sửa video.",
      };
}

/** KOC nộp / nộp lại video cho 1 slot — trả về slot mới (chờ WeWin duyệt sơ bộ). */
export function kocSubmitSlot(slot: VideoSlot, videoUrl?: string): VideoSlot {
  const today = fmtToday();
  const url = videoUrl || slot.videoUrl || SAMPLE("BigBuckBunny.mp4");
  if (slot.status === "awaiting_demo") {
    return { ...slot, status: "review_r1", demo1Date: slot.demo1Date ?? today, videoUrl: url };
  }
  if (slot.status === "revise_r1") {
    return { ...slot, status: "review_r2", demo2Date: today, videoUrl: url };
  }
  if (slot.status === "revise_r2") {
    const next: VideoSlot = { ...slot, status: "review_r2", demo2Date: today, videoUrl: url };
    delete next.round2Note; // nộp lại bản sửa cuối — chờ duyệt lại
    return next;
  }
  return slot;
}

// ── Dòng thời gian 1 slot video (Video 1 hoặc Video 2) ──────────────────────
export type TimelineStep = {
  label: string;
  state: "done" | "current" | "rejected" | "upcoming";
  note: string;
};

/** Biến động 2-6 bước tuỳ có phải sửa / chờ Brand duyệt hay không. */
export function videoSlotTimelineSteps(vid: VideoSlot): TimelineStep[] {
  const steps: TimelineStep[] = [];
  if (!vid.demo1Date) {
    steps.push({ label: "KOC nộp demo (vòng 1)", state: "current", note: "Đang chờ KOC quay & nộp" });
    return steps;
  }
  steps.push({ label: "KOC nộp demo (vòng 1)", state: "done", note: vid.demo1Date });
  if (vid.status === "review_r1") {
    steps.push({ label: "WeWin duyệt sơ bộ (vòng 1)", state: "current", note: "Đang chờ duyệt" });
    return steps;
  }
  const round1Ok = !vid.round1Note;
  steps.push({
    label: "WeWin duyệt sơ bộ (vòng 1)",
    state: round1Ok ? "done" : "rejected",
    note: round1Ok ? "Đạt, không cần sửa" : "Yêu cầu sửa: " + vid.round1Note,
  });
  if (!round1Ok) {
    if (!vid.demo2Date) {
      steps.push({
        label: "KOC nộp bản sửa (vòng 2)",
        state: "current",
        note: "Đang chờ KOC nộp lại",
      });
      return steps;
    }
    steps.push({ label: "KOC nộp bản sửa (vòng 2)", state: "done", note: vid.demo2Date });
    if (vid.status === "review_r2") {
      steps.push({ label: "WeWin duyệt sơ bộ (vòng 2)", state: "current", note: "Đang chờ duyệt" });
      return steps;
    }
    const round2Ok = !vid.round2Note;
    steps.push({
      label: "WeWin duyệt sơ bộ (vòng 2)",
      state: round2Ok ? "done" : "rejected",
      note: round2Ok ? "Đạt" : "Vẫn chưa đạt: " + vid.round2Note,
    });
    if (!round2Ok) {
      steps.push({
        label: "Kết quả",
        state: "current",
        note: "Đã hết 2 lượt sửa theo quy định — chờ Ops quyết định (Từ chối hẳn / xin ngoại lệ Brand)",
      });
      return steps;
    }
  }
  if (vid.status === "brand_review") {
    steps.push({ label: "Brand duyệt chính thức", state: "current", note: "Đang chờ Brand duyệt" });
    return steps;
  }
  steps.push({ label: "Brand duyệt chính thức", state: "done", note: "Đã duyệt" });
  if (!vid.finalDate) {
    steps.push({ label: "DUYỆT FINAL", state: "current", note: "Chờ xác nhận FINAL" });
    return steps;
  }
  steps.push({ label: "DUYỆT FINAL", state: "done", note: vid.finalDate });
  if (vid.airLink) {
    steps.push({
      label: "Lên sóng (air)",
      state: "done",
      note: `${vid.airDate} · Code ads: ${vid.adsCode || "—"}`,
    });
  } else {
    steps.push({ label: "Lên sóng (air)", state: "current", note: "Chờ đăng lên kênh KOC" });
  }
  return steps;
}
