import type { Koc as KocView } from "@/model/User";

/** Shape UI mà bảng/form KOC đang dùng (`id`, `name`, `tier`, `gmv`, `followers`…). */
export type { KocView };

export interface Koc {
    userId:string;
    fullname:string;
    bankAccount?:string;
    typeBank?:string;
    follower:number;
    revenue:number;
    averageSellingPrice:number;
    engagementRate:number;
    livestreamTotalAmount:number;
    videoTotalAmount:number;
    viewer:number;
    linkTiktok?:string;
    facebook?:string;
    zalo?:string;
    gmvPerCustomer:number;
    gmvByProduct:number;
    gmvPerSaleChanel:number;
    followerFemale:number;
    followerMale:number;
    followerAge:number;
    topLocation?:string;
    address?:string;
    ageOfChildren?:string;
    idTiktok?:string;
    kocType?:string;
    productCategoryId?:string;
    status?:string;
    verrsion?:number;
    createdAt?:string;
    updatedAt?:string;
    createdBy?:string;
}
export type KocDto = {
  /** Id thật BE trả về (`GET /kocs` -> `userId`, koc_id = user.id). */
  userId: string;
  /** Tên cũ của id — giữ để tương thích nếu BE trả `kocId`. */
  kocId?: string;
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

/** Tier suy ra từ số follower (BE chưa trả tier riêng — `kocType` là ngành hàng). */
export const tierOfFollowers = (follower?: number | null): string => {
  if (!follower) return "";
  if (follower >= 1_000_000) return "Mega";
  if (follower >= 500_000) return "Macro";
  if (follower >= 50_000) return "Micro";
  return "Nano";
};

/** `"MỸ PHẨM, LÀM ĐẸP, CHĂM SÓC DA", CHĂM SÓC CÁ NHÂN` -> bỏ dấu `"` thừa từ file import CSV. */
const cleanKocType = (v?: string | null) =>
  (v ?? "").replace(/"/g, "").replace(/\s*,\s*/g, ", ").replace(/\s+/g, " ").trim();

/** BE `KocDto` -> UI `Koc` (giữ nguyên các component/table hiện có). */
export const mapKocDtoToKoc = (dto: KocDto): KocView => ({
  id: dto.userId ?? dto.kocId ?? "",
  name: dto.fullname ?? "",
  bankAccount: dto.bankAccount ?? "",
  typeBank: dto.typeBank ?? "",
  revenue: dto.revenue ?? 0,
  averageSellingPrice: dto.averageSellingPrice ?? 0,
  engagementRate: dto.engagementRate ?? 0,
  livestreamTotalAmount: dto.livestreamTotalAmount ?? 0,
  videoTotalAmount: dto.videoTotalAmount ?? 0,
  viewer: dto.viewer ?? 0,
  linkTiktok: dto.linkTiktok || (dto.idTiktok ? `https://www.tiktok.com/@${dto.idTiktok.replace(/^@/, "")}` : ""),
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
  // `kocType` BE trả về là ngành hàng của KOC (VD "FASHION NỮ") — dùng luôn làm "Ngành hàng".
  kocType: cleanKocType(dto.kocType),
  tier: tierOfFollowers(dto.follower),
  // BE hiện chỉ trả `revenue` (doanh thu), chưa có `gmvByProduct` -> lấy revenue làm GMV.
  gmv: dto.gmvByProduct ?? dto.revenue ?? 0,
  followers: dto.follower ?? 0,
  status: dto.status ?? "",
  productCategory: cleanKocType(dto.kocType),
});

/** UI `Koc` (hoặc form values) -> body gửi lên BE. */
export const mapKocToRequest = (koc: Partial<KocView>): KocRequest => ({
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
  // `kocType` = ngành hàng; tier chỉ là giá trị suy ra từ follower, không gửi lên BE.
  kocType: koc.kocType || koc.productCategory || undefined,
  status: koc.status,
});
