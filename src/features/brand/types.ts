// ─── Brand Status ─────────────────────────────────────────────────────────────
export type BrandStatus = "Active" | "Inactive" | "Pending";

// ─── Brand Tier ───────────────────────────────────────────────────────────────
export type BrandTier = "Gold" | "Silver" | "Bronze" | "New";

// ─── Industry ─────────────────────────────────────────────────────────────────
export type BrandIndustry =
  | "Beauty & Skincare"
  | "F&B"
  | "Fashion & Lifestyle"
  | "Technology"
  | "Healthcare"
  | "FMCG"
  | "Travel & Tourism"
  | "Education"
  | "Automotive"
  | "Other";

// ─── Brand ────────────────────────────────────────────────────────────────────
export type Brand = {
  id: number;
  name: string;
  logo?: string;                // URL or initials fallback
  industry: BrandIndustry;
  tier: BrandTier;
  status: BrandStatus;

  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;

  // Business info
  address?: string;
  taxCode?: string;
  description?: string;

  // Stats
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: number;           // VND

  joinDate: string;             // ISO date string
};

// ─── Form Values ──────────────────────────────────────────────────────────────
export type BrandFormValues = {
  name: string;
  industry: BrandIndustry;
  tier: BrandTier;
  status: BrandStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  address?: string;
  taxCode?: string;
  description?: string;
};

// ─── Industry options ─────────────────────────────────────────────────────────
export const INDUSTRY_OPTIONS: BrandIndustry[] = [
  "Beauty & Skincare",
  "F&B",
  "Fashion & Lifestyle",
  "Technology",
  "Healthcare",
  "FMCG",
  "Travel & Tourism",
  "Education",
  "Automotive",
  "Other",
];

// ─── Tier options ─────────────────────────────────────────────────────────────
export const TIER_OPTIONS: BrandTier[] = ["Gold", "Silver", "Bronze", "New"];

// ─── Status options ───────────────────────────────────────────────────────────
export const STATUS_OPTIONS: BrandStatus[] = ["Active", "Inactive", "Pending"];
