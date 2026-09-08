import { api as axiosClient } from "../api/request";

export interface CampaignPayload {
  name: string;
  code: string;
  brand?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const campaignService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    name?: string;
    status?: string;
  }): Promise<any> => {
    const response = await axiosClient.get<any>("/campaigns", { params });
    console.log("CampaignService list response:", response.data);
    return response.data;
  },

  get: async (id: string): Promise<any> => {
    const { data } = await axiosClient.get<any>(`/campaigns/${id}`);
    return data?.data ?? data;
  },

  create: async (payload: CampaignPayload): Promise<any> => {
    const { data } = await axiosClient.post<any>("/campaigns", payload);
    return data?.data ?? data;
  },

  update: async (
    id: string,
    payload: Partial<CampaignPayload>,
  ): Promise<any> => {
    const { data } = await axiosClient.put<any>(`/campaigns/${id}`, payload);
    return data?.data ?? data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/campaigns/${id}`);
  },

  inviteKoc: async (
    campaignId: string,
    payload: { kocId: string; note?: string },
  ): Promise<any> => {
    const { data } = await axiosClient.post<any>(
      `/campaigns/${campaignId}/invite`,
      payload,
    );
    return data?.data ?? data;
  },
};

export default campaignService;
