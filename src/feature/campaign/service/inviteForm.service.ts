import { api as axiosClient, publicApi } from "../../../api/request";
import type { FormSubmission, InviteForm, InviteFormRequest, InviteFormSubmitRequest } from "../model/InviteForm";

// BE trả `ApiResponse<T>` = { success, message, data: T }
const unwrap = <T,>(data: unknown): T => (data as { data: T })?.data;

export const inviteFormService = {
  /** Form của chiến dịch, `null` nếu chưa tạo. */
  get: async (campaignId: string): Promise<InviteForm | null> => {
    const { data } = await axiosClient.get<unknown>(`/campaigns/${campaignId}/invite-form`);
    return unwrap<InviteForm | null>(data) ?? null;
  },

  save: async (campaignId: string, payload: InviteFormRequest): Promise<InviteForm> => {
    const { data } = await axiosClient.put<unknown>(`/campaigns/${campaignId}/invite-form`, payload);
    return unwrap<InviteForm>(data);
  },

  submissions: async (campaignId: string): Promise<FormSubmission[]> => {
    const { data } = await axiosClient.get<unknown>(`/campaigns/${campaignId}/invite-form/submissions`);
    return unwrap<FormSubmission[]>(data) ?? [];
  },

  // ── Public (KOC, không cần đăng nhập) ──
  getPublic: async (campaignId: string): Promise<InviteForm> => {
    const { data } = await publicApi.get<unknown>(`/public/campaigns/${campaignId}/invite-form`);
    return unwrap<InviteForm>(data);
  },

  submit: async (campaignId: string, payload: InviteFormSubmitRequest): Promise<FormSubmission> => {
    const { data } = await publicApi.post<unknown>(`/public/campaigns/${campaignId}/invite-form`, payload);
    return unwrap<FormSubmission>(data);
  },
};

export default inviteFormService;
