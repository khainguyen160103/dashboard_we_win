import type { CampaignKocDto } from "../../model/CampaignKoc";
import { asArray } from "./_shared";

/**
 * Dữ liệu giả lập cho Dashboard — chỉ dùng khi KHÔNG gọi được API
 * (query lỗi hoặc trả về rỗng). Khi backend hoạt động, các số này bị thay hoàn toàn.
 */

export type MockCampaign = {
  id: string;
  name: string;
  brandName: string;
  status: string;
  startTime: string;
  endTime: string;
  targetTotalKoc: number;
};

export const MOCK_CAMPAIGNS: MockCampaign[] = [
  { id: "c1", name: "Comfort - Mùa hè 2026", brandName: "Unilever", status: "ACTIVE", startTime: "2026-06-01", endTime: "2026-08-31", targetTotalKoc: 20 },
  { id: "c2", name: "Sữa rửa mặt X", brandName: "La Roche-Posay", status: "ACTIVE", startTime: "2026-07-10", endTime: "2026-09-20", targetTotalKoc: 12 },
  { id: "c3", name: "Ra mắt sản phẩm Y", brandName: "Samsung Vietnam", status: "ACTIVE", startTime: "2026-05-15", endTime: "2026-08-15", targetTotalKoc: 15 },
  { id: "c4", name: "Khuyến mãi tháng 7", brandName: "Cocoon Vietnam", status: "ACTIVE", startTime: "2026-07-01", endTime: "2026-07-31", targetTotalKoc: 10 },
  { id: "c5", name: "Back to school 2026", brandName: "Highlands Coffee", status: "DONE", startTime: "2026-02-01", endTime: "2026-04-30", targetTotalKoc: 18 },
  { id: "c6", name: "Tết 2026 Sớm", brandName: "Vinamilk", status: "DONE", startTime: "2025-11-01", endTime: "2026-01-20", targetTotalKoc: 25 },
];

export type MockKoc = {
  id: string;
  name: string;
  tier: string;
  kocType: string;
  gmv: number;
  followers: number;
  status: string;
};

export const MOCK_KOCS: MockKoc[] = [
  { id: "k1", name: "Minh Anh Beauty", tier: "Mega", kocType: "Mega", gmv: 4_700_000_000, followers: 4_100_000, status: "ACTIVE" },
  { id: "k2", name: "Bảo Trân Lifestyle", tier: "Macro", kocType: "Macro", gmv: 1_400_000_000, followers: 230_000, status: "ACTIVE" },
  { id: "k3", name: "Gia Hân Skincare", tier: "Macro", kocType: "Macro", gmv: 1_900_000_000, followers: 210_000, status: "ACTIVE" },
  { id: "k4", name: "Thảo My Daily", tier: "Micro", kocType: "Micro", gmv: 700_000_000, followers: 95_000, status: "ACTIVE" },
  { id: "k5", name: "Hoài Thương Mom&Baby", tier: "Micro", kocType: "Micro", gmv: 700_000_000, followers: 88_000, status: "PENDING" },
  { id: "k6", name: "Kim Chi Food Review", tier: "Micro", kocType: "Micro", gmv: 600_000_000, followers: 130_000, status: "ACTIVE" },
  { id: "k7", name: "Quang Huy Gadget", tier: "Nano", kocType: "Nano", gmv: 200_000_000, followers: 42_000, status: "ACTIVE" },
  { id: "k8", name: "Ý Nhi Hobby Corner", tier: "Micro", kocType: "Micro", gmv: 800_000_000, followers: 76_000, status: "PENDING" },
];

export type MockBrand = {
  id: string;
  name: string;
  gmv: number;
  roi: number;
  status: string;
};

export const MOCK_BRANDS: MockBrand[] = [
  { id: "b1", name: "Shopee Vietnam", gmv: 21_000_000_000, roi: 4.7, status: "Active" },
  { id: "b2", name: "Vinamilk", gmv: 14_000_000_000, roi: 4.4, status: "Active" },
  { id: "b3", name: "Samsung Vietnam", gmv: 11_000_000_000, roi: 4.6, status: "Active" },
  { id: "b4", name: "Cocoon Vietnam", gmv: 3_600_000_000, roi: 4.2, status: "Active" },
  { id: "b5", name: "Highlands Coffee", gmv: 2_700_000_000, roi: 4.2, status: "Active" },
  { id: "b6", name: "La Roche-Posay", gmv: 2_300_000_000, roi: 4.0, status: "Active" },
  { id: "b7", name: "TH True Milk", gmv: 2_600_000_000, roi: 3.6, status: "Active" },
];

export type MockJob = {
  id: string;
  campaignId: string;
  campaignName: string;
  brandName: string;
  kocName: string;
  videoTitle: string;
  videoStatus: string;
  invitationStatus: string;
  videoUrl?: string;
  pmFeedback?: string;
  submittedAt?: string;
  approvedAt?: string;
};

export const MOCK_JOBS: MockJob[] = [
  { id: "j1", campaignId: "c1", campaignName: "Comfort - Mùa hè 2026", brandName: "Unilever", kocName: "Minh Anh Beauty", videoTitle: "Review Comfort hương mùa hè", videoStatus: "DA_PHE_DUYET", invitationStatus: "ACCEPTED", videoUrl: "https://example.com/v1", submittedAt: "2026-06-20", approvedAt: "2026-06-23" },
  { id: "j2", campaignId: "c1", campaignName: "Comfort - Mùa hè 2026", brandName: "Unilever", kocName: "Bảo Trân Lifestyle", videoTitle: "Comfort trong routine giặt xả", videoStatus: "CHO_PM_DUYET", invitationStatus: "ACCEPTED", submittedAt: "2026-07-01" },
  { id: "j3", campaignId: "c2", campaignName: "Sữa rửa mặt X", brandName: "La Roche-Posay", kocName: "Gia Hân Skincare", videoTitle: "Da dầu dùng sữa rửa mặt X", videoStatus: "TU_CHOI", invitationStatus: "ACCEPTED", pmFeedback: "Thiếu cảnh cận sản phẩm, cần quay lại đoạn mở đầu.", submittedAt: "2026-07-12" },
  { id: "j4", campaignId: "c3", campaignName: "Ra mắt sản phẩm Y", brandName: "Samsung Vietnam", kocName: "Quang Huy Gadget", videoTitle: "Unbox sản phẩm Y", videoStatus: "", invitationStatus: "INVITED" },
  { id: "j5", campaignId: "c4", campaignName: "Khuyến mãi tháng 7", brandName: "Cocoon Vietnam", kocName: "Thảo My Daily", videoTitle: "Haul Cocoon sale tháng 7", videoStatus: "DA_PHE_DUYET", invitationStatus: "ACCEPTED", submittedAt: "2026-07-08", approvedAt: "2026-07-10" },
  { id: "j6", campaignId: "c5", campaignName: "Back to school 2026", brandName: "Highlands Coffee", kocName: "Ý Nhi Hobby Corner", videoTitle: "Góc học tập cùng Highlands", videoStatus: "DA_PHE_DUYET", invitationStatus: "ACCEPTED", submittedAt: "2026-03-10", approvedAt: "2026-03-14" },
];

/** Job của riêng 1 KOC đang đăng nhập (Cổng KOC). */
export const MOCK_MY_JOBS: MockJob[] = [
  { id: "mj1", campaignId: "c1", campaignName: "Comfort - Mùa hè 2026", brandName: "Unilever", kocName: "Bạn", videoTitle: "Review Comfort hương mùa hè", videoStatus: "DA_PHE_DUYET", invitationStatus: "ACCEPTED", submittedAt: "2026-06-20", approvedAt: "2026-06-24" },
  { id: "mj2", campaignId: "c1", campaignName: "Comfort - Mùa hè 2026", brandName: "Unilever", kocName: "Bạn", videoTitle: "Comfort trong routine giặt xả", videoStatus: "CHO_PM_DUYET", invitationStatus: "ACCEPTED", submittedAt: "2026-07-02" },
  { id: "mj3", campaignId: "c2", campaignName: "Sữa rửa mặt X", brandName: "La Roche-Posay", kocName: "Bạn", videoTitle: "Da dầu dùng sữa rửa mặt X", videoStatus: "TU_CHOI", invitationStatus: "ACCEPTED", pmFeedback: "Thiếu CTA cuối video.", submittedAt: "2026-07-14" },
  { id: "mj4", campaignId: "c3", campaignName: "Ra mắt sản phẩm Y", brandName: "Samsung Vietnam", kocName: "Bạn", videoTitle: "Unbox sản phẩm Y", videoStatus: "", invitationStatus: "INVITED" },
  { id: "mj5", campaignId: "c5", campaignName: "Back to school 2026", brandName: "Highlands Coffee", kocName: "Bạn", videoTitle: "Góc học tập cùng Highlands", videoStatus: "DA_PHE_DUYET", invitationStatus: "ACCEPTED", submittedAt: "2026-03-11", approvedAt: "2026-03-15" },
  { id: "mj6", campaignId: "c5", campaignName: "Back to school 2026", brandName: "Highlands Coffee", kocName: "Bạn", videoTitle: "Vlog khai giảng", videoStatus: "DA_PHE_DUYET", invitationStatus: "ACCEPTED", submittedAt: "2026-04-01", approvedAt: "2026-04-05" },
];

/** KOC trong 1 chiến dịch (Cổng Brand). */
export const MOCK_CAMPAIGN_KOCS: CampaignKocDto[] = [
  { id: "ck1", campaignId: "c1", kocUserId: "k1", status: "BRAND_REVIEW", hasCast: true, desiredCast: 5_500_000, finalCast: null, kocName: "Minh Anh Beauty", kocTier: "Mega", kocFollowers: 4_100_000, kocGmv: 4_700_000_000, kocIdTiktok: "@minhanhbeauty" },
  { id: "ck2", campaignId: "c1", kocUserId: "k3", status: "BRAND_REVIEW", hasCast: true, desiredCast: 2_200_000, finalCast: null, kocName: "Gia Hân Skincare", kocTier: "Macro", kocFollowers: 210_000, kocGmv: 1_900_000_000, kocIdTiktok: "@giahanskincare" },
  { id: "ck3", campaignId: "c1", kocUserId: "k2", status: "APPROVED", hasCast: true, desiredCast: 1_800_000, finalCast: 1_400_000, kocName: "Bảo Trân Lifestyle", kocTier: "Macro", kocFollowers: 230_000, kocGmv: 1_400_000_000, kocIdTiktok: "@baotranlifestyle" },
  { id: "ck4", campaignId: "c1", kocUserId: "k4", status: "CONFIRMED", hasCast: true, desiredCast: 800_000, finalCast: 700_000, kocName: "Thảo My Daily", kocTier: "Micro", kocFollowers: 95_000, kocGmv: 700_000_000, kocIdTiktok: "@thaomydaily" },
  { id: "ck5", campaignId: "c1", kocUserId: "k5", status: "REJECTED", hasCast: false, rejectReason: "Trùng lịch chiến dịch khác", kocName: "Hoài Thương Mom&Baby", kocTier: "Micro", kocFollowers: 88_000, kocGmv: 700_000_000, kocIdTiktok: "@hoaithuongmombaby" },
];

/** Trả về mảng thật nếu gọi được API (không lỗi & có dữ liệu), ngược lại dùng mock. */
export function withFallback<T>(
  query: { data?: unknown; isError?: boolean; isLoading?: boolean },
  mock: T[],
): { rows: T[]; usingMock: boolean } {
  const real = asArray<T>(query.data);
  if (real.length > 0) return { rows: real, usingMock: false };
  // Đang tải lần đầu: chưa fallback vội (tránh nháy mock rồi đổi sang data thật)
  if (query.isLoading) return { rows: [], usingMock: false };
  return { rows: mock, usingMock: true };
}
