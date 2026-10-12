import { api as axiosClient } from "../../../api/request";
import type {
  CampaignKocDto,
  InviteKocPayload,
  UpdateCampaignKocPayload,
} from "../model/CampaignKoc";
import type { KocDto, KocListParams } from "../../koc/model/Koc";
import { mapKocDtoToKoc } from "../../koc/model/Koc";
import type { Koc } from "../../../model/User";

// baseURL = `${VITE_BASE_URL}` (http://localhost:8080/api)
// Controller: campaign-service `CampaignKocController` @RequestMapping("/api/campaigns/{campaignId}/kocs")
const base = (campaignId: string) => `/campaigns/${campaignId}/kocs`;

const unwrapList = <T,>(data: unknown): T[] => {
  const d = data as any;
  if (Array.isArray(d)) return d;
  // BE: ApiResponse<PageResponse<T>> = { data: { data: [...], page, size, ... } }
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const campaignKocService = {
  /** Danh sách KOC đã mời / tham gia chiến dịch (kèm snapshot KOC). */
  list: async (campaignId: string): Promise<CampaignKocDto[]> => {
    const { data } = await axiosClient.get<unknown>(base(campaignId), {
      params: { page: 0, size: 200 },
    });
    return unwrapList<CampaignKocDto>(data);
  },

  /** KOC CHƯA tham gia chiến dịch (cho modal mời KOC) — trả về shape `Koc` của UI. */
  available: async (campaignId: string, params?: KocListParams): Promise<Koc[]> => {
    const { data } = await axiosClient.get<unknown>(`${base(campaignId)}/available`, { params });
    return unwrapList<KocDto>(data).map(mapKocDtoToKoc);
  },

  /** Mời 1..n KOC. */
  invite: async (campaignId: string, payload: InviteKocPayload): Promise<CampaignKocDto[]> => {
    const { data } = await axiosClient.post<unknown>(base(campaignId), payload);
    const d = data as any;
    return Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
  },

  /** Cập nhật 1 KOC trong chiến dịch (trạng thái pipeline / deal giá / ghi chú). */
  update: async (
    campaignId: string,
    kocUserId: string,
    payload: UpdateCampaignKocPayload,
  ): Promise<CampaignKocDto> => {
    const { data } = await axiosClient.patch<unknown>(`${base(campaignId)}/${kocUserId}`, payload);
    return ((data as any)?.data ?? data) as CampaignKocDto;
  },

  /** Gỡ KOC khỏi chiến dịch. */
  remove: async (campaignId: string, kocUserId: string): Promise<void> => {
    await axiosClient.delete(`${base(campaignId)}/${kocUserId}`);
  },
};

export default campaignKocService;
