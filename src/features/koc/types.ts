// ─── Types ────────────────────────────────────────────────────────────────────
export type Platform = "Instagram" | "TikTok" | "YouTube";

export type Gender = "Nam" | "Nữ" | "Khác";

// ─── Dữ liệu phân bổ theo giới tính followers ────────────────────────────────
export type FollowersGenderData = {
  male: number;   // % Nam
  female: number; // % Nữ
  other: number;  // % Khác
};

// ─── Dữ liệu phân bổ độ tuổi followers ──────────────────────────────────────
export type FollowersAgeData = {
  "13-17"?: number;
  "18-24"?: number;
  "25-34"?: number;
  "35-44"?: number;
  "45+"?: number;
};

export type KOCRecord = {
  id: number;

  // ── SHARED FIELDS (cột B 1-10 & cột C — cả Admin lẫn Brand đều xem) ──────
  /** 1. Tên nhà sáng tạo */
  name: string;
  /** 2. Tài khoản NST (TikTok username / handle) */
  tiktokAccount?: string;
  /** 3. Lượng theo dõi */
  followers: number;
  /** 4. Doanh số (₫) */
  gmv?: number;
  /** 5. Giá bán trung bình */
  avgPrice?: number;
  /** 6. Tỷ lệ tương tác (%) */
  engagementRate: number;
  /** 7. Doanh số livestream (₫) */
  livestreamRevenue?: number;
  /** 8. Doanh số video (₫) */
  videoRevenue?: number;
  /** 9. Lượt xem */
  totalViews?: number;
  /** 10. Link TikTok */
  tiktokLink?: string;

  // ── ADMIN-ONLY FIELDS (cột B 11-24 — chỉ Admin xem, ẩn với Brand) ─────────
  /** 11. Email */
  email: string;
  /** 12. Facebook */
  facebook?: string;
  /** 13. Zalo / Số điện thoại */
  phone?: string;
  zalo?: string;
  /** 14. GMV per customer (GMV theo danh mục sản phẩm) */
  gmvPerCustomer?: number;
  /** 15. GPM – Total revenue per 1000 video views or 1000 LIVE viewers */
  gpm?: number;
  /** 16. GMV by product category */
  gmvByCategory?: string;
  /** 17. GMV per sales channel */
  gmvPerChannel?: string;
  /** 18. FollowersGender – phân bổ giới tính người theo dõi */
  followersGender?: FollowersGenderData;
  /** 19. Followers Age – phân bổ độ tuổi người theo dõi */
  followersAge?: FollowersAgeData;
  /** 20. Top 5 locations */
  top5Locations?: string[];
  /** 21. Họ tên đầy đủ */
  fullName?: string;
  /** 22. Địa chỉ nhận hàng mẫu */
  sampleAddress?: string;
  /** 23. Số tài khoản ngân hàng (nhận cast) */
  bankAccount?: string;
  /** 24. Độ tuổi của con */
  childrenAge?: string;

  // ── Legacy / UI helper fields ─────────────────────────────────────────────
  platform: Platform;
  totalPosts: number;
  status: "Active" | "Inactive" | "Pending";
  tier: "Nano" | "Micro" | "Macro" | "Mega";
  joinDate: string;
  category?: string;
  city?: string;
  gender?: Gender;
  joinedCampaignIds?: number[];
};

export type KOCFormValues = {
  name: string;
  email: string;
  phone?: string;
  zalo?: string;
  facebook?: string;
  platform: Platform;
  followers: number;
  engagementRate: number;
  tier: KOCRecord["tier"];
  status: KOCRecord["status"];
  gmv?: number;
  avgPrice?: number;
  livestreamRevenue?: number;
  videoRevenue?: number;
  totalViews?: number;
  tiktokAccount?: string;
  tiktokLink?: string;
  category?: string;
  city?: string;
  gender?: Gender;
  sampleAddress?: string;
  bankAccount?: string;
  childrenAge?: string;
  gmvPerCustomer?: number;
  gpm?: number;
};

export type Recipient = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

export type MessageChannel = "Email" | "Zalo";

export type ScheduledMessage = {
  id: string;
  channel: MessageChannel;
  subject?: string;
  content: string;
  /** ISO datetime string */
  scheduledAt: string;
  recipients: Recipient[];
  createdAt: string;
  /** "pending" = chưa đến ngày gửi, "sent" = đã gửi */
  sendStatus: "pending" | "sent";
};

export type CreateTemplateFormValues = {
  name: string;
  channel: MessageChannel;
  subject?: string;
  content: string;
};

// ─── Scheduled Message Storage ────────────────────────────────────────────────
const SCHEDULED_MSG_KEY = "koc_scheduled_messages";

export const loadScheduledMessages = (): ScheduledMessage[] => {
  try {
    const raw = localStorage.getItem(SCHEDULED_MSG_KEY);
    if (raw) return JSON.parse(raw) as ScheduledMessage[];
  } catch {}
  return [];
};

export const saveScheduledMessages = (msgs: ScheduledMessage[]): void => {
  try {
    localStorage.setItem(SCHEDULED_MSG_KEY, JSON.stringify(msgs));
  } catch {}
};

// ─── Shared predicates ───────────────────────────────────────────────────────
import dayjs from "dayjs";

/** Returns true if the message send time has already passed → "Đã gửi" */
export const isSent = (msg: ScheduledMessage): boolean =>
  msg.sendStatus === "sent" || dayjs().isAfter(dayjs(msg.scheduledAt));
