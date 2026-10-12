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
};


export type CampaignResponse = {
  data: any[];
  total: number;
  page: number;
};