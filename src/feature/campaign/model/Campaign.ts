export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string | null;
  /** Nhãn hàng gắn với chiến dịch (hiển thị ở bảng danh sách & trang chi tiết). */
  brandName?: string | null;
  /** Ngành hàng / chủ đề chiến dịch. */
  category?: string | null;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  targetTotalKoc?: number | null;
  tierKocRequire?: string | null;
  version?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | Date | null;
  deletedBy?: string | null;
}

export type CampaignPayload = Omit<
  Campaign,
  | "id"
  | "version"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
  | "updatedBy"
  | "isDeleted"
  | "deletedAt"
  | "deletedBy"
>;

export type CampaignRequest = {
  name: string;
  type: string;
  status: string;
  description?: string;
  brandName?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  targetTotalKoc?: number;
  tierKocRequire?: string;
  /** UUID ngành hàng (`/api/product-categories`). */
  productCategoryId?: string;
  /** UUID nhãn hàng (= users.id của tài khoản Brand) — BE gắn qua user_campaign. */
  brandId?: string;
  /** users.id của PM phụ trách. */
  pmId?: string;
  /** users.id của Account (Sale Account). */
  acId?: string;
  /** Hoa hồng cấp chiến dịch — typeCommission: KOC | TAP; fromNormal = organic %, fromAdv = ads %. */
  commission?: { typeCommission: "KOC" | "TAP"; fromNormal?: number; fromAdv?: number }[];
  /** Cast / số video / deadline nội dung (cấp chiến dịch). typeCast: CAST = trả phí, NONE = không. */
  castMemberRequest?: {
    typeCast: "CAST" | "NONE";
    totalCast?: number;
    totalVideo?: number;
    deadlineTime?: string;
    description?: string;
  };
  requireContentApproval?: boolean;
  /** users.id của NV Vận hành (role OP). */
  operatorIds?: string[];
};


export type CampaignResponse = {
  data: any[];
  total: number;
  page: number;
};