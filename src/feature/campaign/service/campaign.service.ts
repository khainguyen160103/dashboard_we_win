import { api as axiosClient } from "../api/request";
import type { Campaign, CampaignRequest } from "../model/Campaign";
import { ApiResponsePage } from "../model/request";

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
  const content: Campaign[] = Array.isArray(page)
    ? page
    : Array.isArray(page?.content)
      ? page.content
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
    limit?: number;
    name?: string;
    status?: string;
  }): Promise<CampaignPage> => {
    const response = await axiosClient.get<unknown>("/campaigns", {
      params,
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
  overview: async (): Promise<Campaign[]> => {
    const response = await axiosClient.get<ApiResponsePage<Campaign>>(
      "/campaigns/overview",
    );
    return response?.data?.data;
  },
};

export default campaignService;
