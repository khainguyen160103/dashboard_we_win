
import { useQuery } from "@tanstack/react-query";
import type { CampaignPayload } from "../../services/campaign.service";

import { campaignService } from "../services/campaign.service"

export const useCampaign = { 
    overview: () => { 
        return useQuery({
              queryKey: ["overview"],
              queryFn: () => campaignService.overview(),
            });
    }
}