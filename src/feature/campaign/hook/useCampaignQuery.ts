import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "../service/campaign.service";
import type { CampaignPayload } from "../service/campaign.service";
import { queryKeys } from "../../../hooks/query/queryKeys";

type CampaignListParams = {
  page?: number;
  limit?: number;
  size?: number;
  name?: string;
  status?: string;
  /** true = chỉ chiến dịch của user đang đăng nhập (Brand/KOC được gắn vào chiến dịch). */
  mine?: boolean;
  /** Chiến dịch mà user (Brand/KOC) này được gắn vào. */
  memberUserId?: string;
};

export const useCampaigns = (params?: CampaignListParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.campaigns.list(params),
    queryFn: () => campaignService.list(params),
    staleTime: 1000 * 60 * 5, // 5 mins
    enabled: options?.enabled ?? true,
  });

export const useCampaignOverview = () =>
  useQuery({
    // Nằm dưới `lists()` để các mutation create/update/delete invalidate luôn tab Tổng quan.
    queryKey: [...queryKeys.campaigns.lists(), "overview"],
    queryFn: () => campaignService.overview(),
  });

export const useCampaign = (id: string, enabled = true) =>
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
