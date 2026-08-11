import { api as axiosClient } from "../api/request";

export type CampaignPayload = {
  name: string;
  description?: string;
  brandName?: string;
  category?: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "COMPLETED" | string;
};

export type InviteKocPayload = {
  userIds: string[];
};

export const campaignService = {
  list: async (params?: { page?: number; limit?: number; q?: string; status?: string }): Promise<any[]> => {
    const { data } = await axiosClient.get<any>('/campaigns', { params }).catch(() =>
      axiosClient.get<any>('/api/campaigns', { params })
    );
    if (Array.isArray(data)) return data;
    if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content;
    if (data?.content && Array.isArray(data.content)) return data.content;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  },

  get: async (id: string): Promise<any> => {
    const { data } = await axiosClient.get<any>(`/campaigns/${id}`).catch(() =>
      axiosClient.get<any>(`/api/campaigns/${id}`)
    );
    return data?.data ?? data;
  },

  create: async (payload: CampaignPayload): Promise<any> => {
    const { data } = await axiosClient.post<any>('/campaigns', payload).catch(() =>
      axiosClient.post<any>('/api/campaigns', payload)
    );
    return data?.data ?? data;
  },

  update: async (id: string, payload: Partial<CampaignPayload>): Promise<any> => {
    const { data } = await axiosClient.put<any>(`/campaigns/${id}`, payload).catch(() =>
      axiosClient.put<any>(`/api/campaigns/${id}`, payload)
    );
    return data?.data ?? data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/campaigns/${id}`).catch(() =>
      axiosClient.delete(`/api/campaigns/${id}`)
    );
  },

  inviteKocs: async (campaignId: string, payload: InviteKocPayload): Promise<any> => {
    const { data } = await axiosClient.post<any>(`/campaigns/${campaignId}/invite`, payload).catch(() =>
      axiosClient.post<any>(`/api/campaigns/${campaignId}/invite`, payload)
    );
    return data?.data ?? data;
  },
};

export default campaignService;
