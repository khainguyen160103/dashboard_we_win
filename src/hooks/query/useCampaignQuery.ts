import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import campaignService from "../../services/campaign.service";
import type { CampaignPayload, InviteKocPayload } from "../../services/campaign.service";
import { queryKeys } from "./queryKeys";

type CampaignListParams = { page?: number; limit?: number; q?: string; status?: string };

export const useCampaignsQuery = (params?: CampaignListParams) =>
  useQuery({
    queryKey: queryKeys.campaigns.list(params),
    queryFn: () => campaignService.list(params),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

export const useCampaignQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => campaignService.get(id),
    enabled: Boolean(id) && enabled,
  });

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CampaignPayload) => campaignService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
    },
  });
};

export const useUpdateCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CampaignPayload> }) =>
      campaignService.update(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
      if (updated?.id) {
        queryClient.setQueryData(queryKeys.campaigns.detail(String(updated.id)), updated);
      }
    },
  });
};

export const useDeleteCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.remove(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.campaigns.detail(id) });
    },
  });
};

export const useInviteKocMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, payload }: { campaignId: string; payload: InviteKocPayload }) =>
      campaignService.inviteKocs(campaignId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};
