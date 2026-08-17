// ─── Kalodata Creator Types ───────────────────────────────────────────────────
export type KalodataRegion = "VN" | "US" | "TH" | "GB" | "ID" | "MY" | "PH" | "SG";
export type KalodataDateRange =
  | "last7Day"
  | "last30Day"
  | "last90Day"
  | "lastMonth"
  | "last3Month";

export type KalodataCreator = {
  creator_id: string;
  creator_nickname: string;
  creator_handle: string;
  /** Tổng doanh số (VND / USD tuỳ currency) */
  revenue: number;
  /** Tỷ lệ tăng trưởng doanh số (%) */
  revenue_growth_rate: number;
  /** Tổng lượt xem content */
  content_views: string;
  /** Số người theo dõi */
  creator_followers: string;
  /** Số đơn hàng */
  sales_volumn: number;
  /** Doanh số từ video */
  video_revenue: number;
  /** Doanh số từ livestream */
  live_revenue: number;
  category_list: string[] | null;
  category_id_list: string[] | null;
  ter_category_list: string[] | null;
  ter_category_id_list: string[] | null;
};

export type KalodataCreatorRankRequest = {
  region: KalodataRegion;
  language: string;
  currency: string;
  date_range: KalodataDateRange;
  page?: number;
  page_size?: number;
};

export type KalodataCreatorRankResponse = {
  success: boolean;
  data: KalodataCreator[];
  message: string | null;
  cached: boolean | null;
  code: string | null;
};
