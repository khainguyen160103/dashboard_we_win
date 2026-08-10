// ─── Types ────────────────────────────────────────────────────────────────────
export type Platform = "Instagram" | "TikTok" | "YouTube";

export type Gender = "Nam" | "Nữ" | "Khác";

export type KOCRecord = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  platform: Platform;
  followers: number;
  engagementRate: number;
  totalPosts: number;
  status: "Active" | "Inactive" | "Pending";
  tier: "Nano" | "Micro" | "Macro" | "Mega";
  joinDate: string;

  // New fields requested by user for advanced filtering:
  gmv?: number; // Doanh số GMV tạo ra (VND)
  category?: string; // Đặc điểm kênh / Chủ đề (Beauty, Fashion, Tech, F&B, Travel...)
  city?: string; // Địa chỉ / Thành phố (Hà Nội, TP.HCM, Đà Nẵng...)
  gender?: Gender; // Giới tính (Nam, Nữ)
  joinedCampaignIds?: number[]; // Danh sách ID chiến dịch đã tham gia
};

export type KOCFormValues = {
  name: string;
  email: string;
  phone?: string;
  platform: Platform;
  followers: number;
  engagementRate: number;
  tier: KOCRecord["tier"];
  status: KOCRecord["status"];
  gmv?: number;
  category?: string;
  city?: string;
  gender?: Gender;
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
