export type CustomFieldType = "text" | "textarea" | "number" | "select" | "multiselect" | "date";

export const CUSTOM_FIELD_TYPE_LABEL: Record<CustomFieldType, string> = {
  text: "Văn bản ngắn",
  textarea: "Đoạn văn",
  number: "Số",
  select: "Chọn 1",
  multiselect: "Chọn nhiều",
  date: "Ngày",
};

/** Trường tuỳ chỉnh — Wewin thêm/sửa/xoá được. */
export type InviteFormField = {
  key: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[];
};

/**
 * Trường cố định — luôn có trong form, không sửa/xoá. Giá trị ghi vào bảng `koc`
 * (BE: `InviteFormSubmitRequest`), nên `key` phải khớp tên field phía BE.
 */
export const FIXED_FIELDS: { key: FixedFieldKey; label: string; type: "text" | "textarea" | "number" | "email"; required: boolean; placeholder?: string }[] = [
  { key: "fullname", label: "Họ và tên", type: "text", required: true },
  { key: "zalo", label: "Số điện thoại / Zalo", type: "text", required: true, placeholder: "09xxxxxxxx" },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "linkTiktok", label: "Link kênh TikTok", type: "text", required: true, placeholder: "https://www.tiktok.com/@..." },
  { key: "idTiktok", label: "ID TikTok", type: "text", required: true, placeholder: "@kenhcuaban" },
  { key: "follower", label: "Số followers", type: "number", required: false },
  { key: "gmv30", label: "GMV 30 ngày gần nhất (đ)", type: "number", required: false },
  { key: "address", label: "Địa chỉ nhận hàng mẫu", type: "textarea", required: true },
];

export type FixedFieldKey = "fullname" | "zalo" | "email" | "linkTiktok" | "idTiktok" | "follower" | "gmv30" | "address";

export type InviteForm = {
  id: string;
  campaignId: string;
  campaignName?: string;
  campaignStartTime?: string | null;
  campaignEndTime?: string | null;
  title?: string | null;
  description?: string | null;
  active: boolean;
  customFields: InviteFormField[];
  updatedAt?: string;
};

export type InviteFormRequest = {
  title?: string;
  description?: string;
  active?: boolean;
  customFields: InviteFormField[];
};

export type InviteFormSubmitRequest = Partial<Record<FixedFieldKey, string | number | null>> & {
  customAnswers: Record<string, unknown>;
  /** Từ `?src=` của link. */
  source?: string | null;
};

export type FormSubmission = {
  id: string;
  campaignId: string;
  kocUserId: string;
  /** Trạng thái KOC trong chiến dịch (`CampaignKocStatus`). */
  status?: string | null;
  /** Nguồn link (facebook, zalo..., "direct"). */
  source?: string | null;
  fixedAnswers: Partial<Record<FixedFieldKey, string | number | null>>;
  customAnswers: Record<string, unknown>;
  submittedAt: string;
};

// ─── Nguồn link (?src=) ──────────────────────────────────────────────────────

/** Nền tảng có link sẵn trong tab "Form mời". Nguồn tự đặt khác vẫn được nhận. */
export const FORM_SOURCES = [
  { key: "facebook", label: "Facebook", color: "blue" },
  { key: "zalo", label: "Zalo", color: "geekblue" },
  { key: "tiktok", label: "TikTok", color: "magenta" },
  { key: "messenger", label: "Messenger", color: "purple" },
  { key: "instagram", label: "Instagram", color: "volcano" },
  { key: "email", label: "Email", color: "gold" },
] as const;

const SOURCE_META: Record<string, { label: string; color: string }> = {
  ...Object.fromEntries(FORM_SOURCES.map((s) => [s.key, { label: s.label, color: s.color }])),
  direct: { label: "Trực tiếp", color: "default" },
};

export const sourceMeta = (key?: string | null) =>
  SOURCE_META[key || "direct"] ?? { label: key as string, color: "cyan" };

/** Giống `normalizeSource` ở BE: chữ thường, bỏ dấu, chỉ [a-z0-9_-], tối đa 50 ký tự. */
export const normalizeSource = (raw?: string | null) =>
  (raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 50);

/** Đường dẫn public KOC mở để điền form; `source` -> `?src=` để biết đơn đến từ đâu. */
export const inviteFormPath = (campaignId: string) => `/${campaignId}/form-invite`;
export const inviteFormUrl = (campaignId: string, source?: string) =>
  `${window.location.origin}${inviteFormPath(campaignId)}${source ? `?src=${encodeURIComponent(source)}` : ""}`;
