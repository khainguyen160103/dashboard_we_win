import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import campaignKocService from "../../services/campaignKoc.service";
import type { InviteKocPayload, UpdateCampaignKocPayload } from "../../model/CampaignKoc";
import type { KocListParams } from "../../model/Koc";
import { queryKeys } from "./queryKeys";

/** KOC đã mời / tham gia của một chiến dịch. */
export const useCampaignKocsQuery = (campaignId?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.campaignKocs.list(campaignId ?? ""),
    queryFn: () => campaignKocService.list(campaignId as string),
    enabled: Boolean(campaignId) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 2,
  });

/** KOC CHƯA tham gia chiến dịch (dùng cho modal mời KOC). */
export const useAvailableKocsQuery = (
  campaignId?: string,
  params?: KocListParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: queryKeys.campaignKocs.available(campaignId ?? "", params),
    queryFn: () => campaignKocService.available(campaignId as string, params),
    enabled: Boolean(campaignId) && (options?.enabled ?? true),
    staleTime: 1000 * 60,
  });

export const useInviteKocsMutation = (campaignId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteKocPayload) => campaignKocService.invite(campaignId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaignKocs.forCampaign(campaignId) });
    },
  });
};

export const useUpdateCampaignKocMutation = (campaignId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kocUserId, payload }: { kocUserId: string; payload: UpdateCampaignKocPayload }) =>
      campaignKocService.update(campaignId, kocUserId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaignKocs.forCampaign(campaignId) });
    },
  });
};

export const useRemoveCampaignKocMutation = (campaignId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kocUserId: string) => campaignKocService.remove(campaignId, kocUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaignKocs.forCampaign(campaignId) });
    },
  });
};
