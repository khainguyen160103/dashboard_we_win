import type { Koc } from "./User";

/**
 * Payload trả về từ backend `GET /api/kocs` (campaign-service `KocDto`).
 * Lưu ý field khác tên với UI `Koc`: `kocId`, `follower` (số ít), không có `gmv`/`tier`/`name`.
 */
export type KocDto = {
  kocId: string;
  fullname: string;
  bankAccount?: string;
  typeBank?: string;
  follower?: number;
  revenue?: number;
  averageSellingPrice?: number;
  engagementRate?: number;
  livestreamTotalAmount?: number;
  videoTotalAmount?: number;
  viewer?: number;
  linkTiktok?: string;
  facebook?: string;
  zalo?: string;
  gmvPerCustomer?: number;
  gmvByProduct?: number;
  gmvPerSaleChanel?: number;
  followerFemale?: number;
  followerMale?: number;
  followerAge?: number;
  topLocation?: string;
  address?: string;
  ageOfChildren?: number;
  idTiktok?: string;
  kocType?: string;
  productCategoryId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

/** Chỉ số cho bộ lọc "≥ giá trị tối thiểu" (khớp enum `KocMetric` phía BE). */
export type KocMetric = "GMV" | "FOLLOWER" | "AVG_REVENUE";

export type KocSortBy =
  | "createdAt"
  | "fullname"
  | "follower"
  | "gmvByProduct"
  | "averageSellingPrice"
  | "status";

/** Query params của `GET /api/kocs`. */
export type KocListParams = {
  keyword?: string;
  tier?: string;
  status?: string;
  productCategoryId?: string;
  metric?: KocMetric;
  minValue?: number;
  sortBy?: KocSortBy;
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
};

/** Body cho `POST` / `PUT /api/kocs` (campaign-service `KocRequest`). */
export type KocRequest = {
  fullname: string;
  /** Bắt buộc khi tạo mới (BE tạo user role KOC, koc_id = user.id). Bỏ qua khi update. */
  email?: string;
  bankAccount?: string;
  typeBank?: string;
  follower?: number;
  revenue?: number;
  averageSellingPrice?: number;
  engagementRate?: number;
  livestreamTotalAmount?: number;
  videoTotalAmount?: number;
  viewer?: number;
  linkTiktok?: string;
  facebook?: string;
  zalo?: string;
  gmvPerCustomer?: number;
  gmvByProduct?: number;
  gmvPerSaleChanel?: number;
  followerFemale?: number;
  followerMale?: number;
  followerAge?: number;
  topLocation?: string;
  address?: string;
  ageOfChildren?: number;
  idTiktok?: string;
  kocType?: string;
  productCategoryId?: string;
  status?: string;
};

/** BE `KocDto` -> UI `Koc` (giữ nguyên các component/table hiện có). */
export const mapKocDtoToKoc = (dto: KocDto): Koc => ({
  id: dto.kocId,
  name: dto.fullname ?? "",
  bankAccount: dto.bankAccount ?? "",
  typeBank: dto.typeBank ?? "",
  revenue: dto.revenue ?? 0,
  averageSellingPrice: dto.averageSellingPrice ?? 0,
  engagementRate: dto.engagementRate ?? 0,
  livestreamTotalAmount: dto.livestreamTotalAmount ?? 0,
  videoTotalAmount: dto.videoTotalAmount ?? 0,
  viewer: dto.viewer ?? 0,
  linkTiktok: dto.linkTiktok ?? "",
  facebook: dto.facebook ?? "",
  zalo: dto.zalo ?? "",
  gmvPerCustomer: dto.gmvPerCustomer ?? 0,
  gmvByProduct: dto.gmvByProduct ?? 0,
  gmvPerSaleChanel: dto.gmvPerSaleChanel ?? 0,
  followerFemale: dto.followerFemale ?? 0,
  followerMale: dto.followerMale ?? 0,
  followerAge: dto.followerAge ?? 0,
  topLocation: dto.topLocation ?? "",
  address: dto.address ?? "",
  ageOfChildren: dto.ageOfChildren != null ? String(dto.ageOfChildren) : "",
  idTiktok: dto.idTiktok ?? "",
  kocType: dto.kocType ?? "",
  // BE dùng chung `kocType` cho cả "Tier" lẫn "Loại KOC" (xem KocFilterRequest).
  tier: dto.kocType ?? "",
  gmv: dto.gmvByProduct ?? 0,
  followers: dto.follower ?? 0,
  status: dto.status ?? "",
  productCategory: dto.productCategoryId ?? "",
});

/** UI `Koc` (hoặc form values) -> body gửi lên BE. */
export const mapKocToRequest = (koc: Partial<Koc>): KocRequest => ({
  fullname: koc.name ?? "",
  email: koc.email?.trim() || undefined,
  bankAccount: koc.bankAccount,
  typeBank: koc.typeBank,
  follower: koc.followers,
  revenue: koc.revenue,
  averageSellingPrice: koc.averageSellingPrice,
  engagementRate: koc.engagementRate,
  livestreamTotalAmount: koc.livestreamTotalAmount,
  videoTotalAmount: koc.videoTotalAmount,
  viewer: koc.viewer,
  linkTiktok: koc.linkTiktok,
  facebook: koc.facebook,
  zalo: koc.zalo,
  gmvPerCustomer: koc.gmvPerCustomer,
  gmvByProduct: koc.gmvByProduct ?? koc.gmv,
  gmvPerSaleChanel: koc.gmvPerSaleChanel,
  followerFemale: koc.followerFemale,
  followerMale: koc.followerMale,
  followerAge: koc.followerAge,
  topLocation: koc.topLocation,
  address: koc.address,
  ageOfChildren:
    koc.ageOfChildren != null && koc.ageOfChildren !== ""
      ? Number.parseInt(String(koc.ageOfChildren), 10) || undefined
      : undefined,
  idTiktok: koc.idTiktok,
  kocType: koc.kocType ?? koc.tier,
  productCategoryId: koc.productCategory || undefined,
  status: koc.status,
});
