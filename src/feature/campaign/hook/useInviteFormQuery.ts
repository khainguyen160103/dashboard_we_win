import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import inviteFormService from "../service/inviteForm.service";
import type { InviteFormRequest, InviteFormSubmitRequest } from "../model/InviteForm";
import { queryKeys } from "../../../hooks/query/queryKeys";

export const inviteFormKeys = {
  form: (campaignId: string) => [...queryKeys.campaigns.detail(campaignId), "inviteForm"] as const,
  submissions: (campaignId: string) => [...inviteFormKeys.form(campaignId), "submissions"] as const,
  public: (campaignId: string) => ["publicInviteForm", campaignId] as const,
};

/** Form mời của chiến dịch (`null` nếu chưa tạo). */
export const useInviteFormQuery = (campaignId?: string) =>
  useQuery({
    queryKey: inviteFormKeys.form(campaignId ?? ""),
    queryFn: () => inviteFormService.get(campaignId as string),
    enabled: Boolean(campaignId),
  });

export const useInviteFormSubmissionsQuery = (campaignId?: string) =>
  useQuery({
    queryKey: inviteFormKeys.submissions(campaignId ?? ""),
    queryFn: () => inviteFormService.submissions(campaignId as string),
    enabled: Boolean(campaignId),
  });

export const useSaveInviteFormMutation = (campaignId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteFormRequest) => inviteFormService.save(campaignId, payload),
    onSuccess: (form) => {
      queryClient.setQueryData(inviteFormKeys.form(campaignId), form);
    },
  });
};

// ── Public (KOC) ──

export const usePublicInviteFormQuery = (campaignId?: string) =>
  useQuery({
    queryKey: inviteFormKeys.public(campaignId ?? ""),
    queryFn: () => inviteFormService.getPublic(campaignId as string),
    enabled: Boolean(campaignId),
    retry: false,
  });

export const useSubmitInviteFormMutation = (campaignId: string) =>
  useMutation({
    mutationFn: (payload: InviteFormSubmitRequest) => inviteFormService.submit(campaignId, payload),
  });
