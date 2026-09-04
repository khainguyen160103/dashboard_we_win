import type {
  Brand,
  BrandFormValues,
  BrandIndustry,
  BrandStatus,
  BrandTier,
} from "../components/brand/types";

/**
 * Payload trả về từ backend `GET /api/brands` (campaign-service `BrandDto`).
 * Khai báo lỏng (mọi field optional) + nhận cả camelCase lẫn snake_case để
 * mapper `mapBrandDtoToBrand` chịu được nhiều biến thể contract.
 */
export type BrandDto = {
  id?: string | number;
  brandId?: string | number;

  name?: string;
  logo?: string | null;
  industry?: string | null;
  /** Ngành hàng theo taxonomy TikTok Shop (nếu BE có). */
  industryVN?: string | null;
  industryVn?: string | null;
  industry_vn?: string | null;
  tier?: string | null;
  status?: string | null;

  contactName?: string | null;
  contact_name?: string | null;
  contactEmail?: string | null;
  contact_email?: string | null;
  contactPhone?: string | null;
  contact_phone?: string | null;
  contactRole?: string | null;
  contact_role?: string | null;

  website?: string | null;
  address?: string | null;
  taxCode?: string | null;
  tax_code?: string | null;
  description?: string | null;

  totalCampaigns?: number | null;
  total_campaigns?: number | null;
  activeCampaigns?: number | null;
  active_campaigns?: number | null;
  runningCampaigns?: number | null;

  totalSpent?: number | null;
  total_spent?: number | null;
  agencyRevenue?: number | null;
  agency_revenue?: number | null;

  gmv?: number | null;
  roi?: number | null;

  contractEndDate?: string | null;
  contract_end_date?: string | null;
  churnRisk?: boolean | null;
  churn_risk?: boolean | null;
  churnReason?: string | null;
  churn_reason?: string | null;

  joinDate?: string | null;
  join_date?: string | null;
  createdAt?: string | null;
};

/** Query params của `GET /api/brands`. */
export type BrandListParams = {
  keyword?: string;
  q?: string;
  industry?: string;
  tier?: string;
  status?: string;
  page?: number;
  size?: number;
};

/** Body cho `POST` / `PUT /api/brands`. */
export type BrandRequest = {
  name: string;
  industry: BrandIndustry;
  industryVN?: string;
  tier: BrandTier;
  status: BrandStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole?: string;
  website?: string;
  address?: string;
  taxCode?: string;
  description?: string;
  contractEndDate?: string;
};

const n = (v?: number | null): number => (typeof v === "number" ? v : 0);
const s = (v?: string | null): string => (typeof v === "string" ? v : "");

/** BE `BrandDto` -> UI `Brand`. */
export const mapBrandDtoToBrand = (dto: BrandDto): Brand => ({
  id: dto.id ?? dto.brandId ?? "",
  name: s(dto.name),
  logo: dto.logo ?? undefined,
  industry: (dto.industry ?? "Other") as BrandIndustry,
  industryVN: dto.industryVN ?? dto.industryVn ?? dto.industry_vn ?? undefined,
  tier: (dto.tier ?? "New") as BrandTier,
  status: (dto.status ?? "Pending") as BrandStatus,

  contactName: s(dto.contactName ?? dto.contact_name),
  contactEmail: s(dto.contactEmail ?? dto.contact_email),
  contactPhone: s(dto.contactPhone ?? dto.contact_phone),
  contactRole: dto.contactRole ?? dto.contact_role ?? undefined,

  website: dto.website ?? undefined,
  address: dto.address ?? undefined,
  taxCode: dto.taxCode ?? dto.tax_code ?? undefined,
  description: dto.description ?? undefined,

  totalCampaigns: n(dto.totalCampaigns ?? dto.total_campaigns),
  activeCampaigns: n(dto.activeCampaigns ?? dto.active_campaigns ?? dto.runningCampaigns),
  totalSpent: n(dto.totalSpent ?? dto.total_spent ?? dto.agencyRevenue ?? dto.agency_revenue),

  gmv: dto.gmv ?? undefined,
  roi: dto.roi ?? undefined,
  contractEndDate: dto.contractEndDate ?? dto.contract_end_date ?? undefined,
  churnRisk: dto.churnRisk ?? dto.churn_risk ?? undefined,
  churnReason: dto.churnReason ?? dto.churn_reason ?? undefined,

  joinDate: s(dto.joinDate ?? dto.join_date ?? dto.createdAt) || new Date().toISOString().split("T")[0],
});

/** UI form values -> body gửi lên BE. */
export const mapBrandToRequest = (values: BrandFormValues): BrandRequest => ({
  name: values.name,
  industry: values.industry,
  tier: values.tier,
  status: values.status,
  contactName: values.contactName,
  contactEmail: values.contactEmail,
  contactPhone: values.contactPhone,
  website: values.website?.trim() || undefined,
  address: values.address?.trim() || undefined,
  taxCode: values.taxCode?.trim() || undefined,
  description: values.description?.trim() || undefined,
});
