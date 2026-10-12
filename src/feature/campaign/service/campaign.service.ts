import { api as axiosClient } from "../../../api/request";
import type { Campaign, CampaignRequest } from "../model/Campaign";

export type CampaignPayload = CampaignRequest;

export type CampaignPage = {
  content: Campaign[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

const unwrapPage = (data: unknown): CampaignPage => {
  const d = data as any;
  const page = d?.data ?? d;
  // BE có thể trả: mảng trần | { content: [...] } | { data: [...] } (giống /kocs)
  const content: Campaign[] = Array.isArray(page)
    ? page
    : Array.isArray(page?.content)
      ? page.content
      : Array.isArray(page?.data)
        ? page.data
        : [];
  return {
    content,
    page: page?.page ?? 0,
    size: page?.size ?? content.length,
    totalElements: page?.totalElements ?? content.length,
    totalPages: page?.totalPages ?? 1,
    last: page?.last ?? true,
  };
};

const unwrapOne = (data: unknown): Campaign => {
  const d = data as any;
  return (d?.data ?? d) as Campaign;
};

export const campaignService = {
  list: async (params?: {
    page?: number;
    /** Alias của `size` — BE chỉ nhận `size` (mặc định 20). */
    limit?: number;
    size?: number;
    name?: string;
    status?: string;
    /** true = chỉ chiến dịch của user đang đăng nhập (Brand/KOC được gắn vào chiến dịch). */
    mine?: boolean;
    /** Chiến dịch mà user (Brand/KOC) này được gắn vào. */
    memberUserId?: string;
  }): Promise<CampaignPage> => {
    const { limit, ...rest } = params ?? {};
    const response = await axiosClient.get<unknown>("/campaigns", {
      params: { ...rest, size: rest.size ?? limit },
    });
    return unwrapPage(response.data);
  },

  get: async (id: string): Promise<Campaign> => {
    const { data } = await axiosClient.get<unknown>(`/campaigns/${id}`);
    return unwrapOne(data);
  },

  create: async (payload: CampaignPayload): Promise<Campaign> => {
    const { data } = await axiosClient.post<unknown>("/campaigns", payload);
    return unwrapOne(data);
  },

  update: async (
    id: string,
    payload: Partial<CampaignPayload>,
  ): Promise<Campaign> => {
    const { data } = await axiosClient.put<unknown>(
      `/campaigns/${id}`,
      payload,
    );
    return unwrapOne(data);
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/campaigns/${id}`);
  },
  overview: async (params: { page?: number; size?: number } = { size: 200 }): Promise<Campaign[]> => {
    const { data } = await axiosClient.get<unknown>("/campaigns/overview", { params });
    return unwrapPage(data).content;
  },
};

export default campaignService;
