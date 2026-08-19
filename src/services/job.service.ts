import { api as axiosClient } from "../api/request";

export type RespondJobPayload = {
  action: "ACCEPT" | "REJECT";
};

export type SubmitVideoPayload = {
  videoTitle: string;
  videoUrl: string;
};

export type ReviewVideoPayload = {
  videoStatus: "DA_PHE_DUYET" | "TU_CHOI" | "CHO_PM_DUYET" | string;
  qualityRating: "XUAT_SAC" | "TOT" | "DAT" | "KEM" | string;
  pmFeedback: string;
};

export const jobService = {
  list: async (params?: { videoStatus?: string; invitationStatus?: string; page?: number; limit?: number }): Promise<any[]> => {
    const { data } = await axiosClient.get<any>('/jobs', { params }).catch(() =>
      axiosClient.get<any>('/api/jobs', { params })
    );
    if (Array.isArray(data)) return data;
    if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content;
    if (data?.content && Array.isArray(data.content)) return data.content;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  },

  myJobs: async (): Promise<any[]> => {
    const { data } = await axiosClient.get<any>('/jobs/my-jobs').catch(() =>
      axiosClient.get<any>('/api/jobs/my-jobs')
    );
    if (Array.isArray(data)) return data;
    if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content;
    if (data?.content && Array.isArray(data.content)) return data.content;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  },

  get: async (id: string): Promise<any> => {
    const { data } = await axiosClient.get<any>(`/jobs/${id}`).catch(() =>
      axiosClient.get<any>(`/api/jobs/${id}`)
    );
    return data?.data ?? data;
  },

  respond: async (jobId: string, payload: RespondJobPayload): Promise<any> => {
    const { data } = await axiosClient.put<any>(`/jobs/${jobId}/respond`, payload).catch(() =>
      axiosClient.put<any>(`/api/jobs/${jobId}/respond`, payload)
    );
    return data?.data ?? data;
  },

  submitVideo: async (jobId: string, payload: SubmitVideoPayload): Promise<any> => {
    const { data } = await axiosClient.post<any>(`/jobs/${jobId}/submit-video`, payload).catch(() =>
      axiosClient.post<any>(`/api/jobs/${jobId}/submit-video`, payload)
    );
    return data?.data ?? data;
  },

  reviewVideo: async (jobId: string, payload: ReviewVideoPayload): Promise<any> => {
    const { data } = await axiosClient.put<any>(`/jobs/${jobId}/review-video`, payload).catch(() =>
      axiosClient.put<any>(`/api/jobs/${jobId}/review-video`, payload)
    );
    return data?.data ?? data;
  },
};

export default jobService;
