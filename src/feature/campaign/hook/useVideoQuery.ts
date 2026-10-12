import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import videoService from "../service/video.service";
import type { VideoDto, VideoListParams, VideoRequest } from "../model/Video";

export const videoKeys = {
  all: ["videos"] as const,
  list: (params?: VideoListParams) => [...videoKeys.all, "list", params ?? {}] as const,
};

export const useVideosQuery = (params?: VideoListParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: videoKeys.list(params),
    queryFn: () => videoService.list(params),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60,
  });

export const useCreateVideoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VideoRequest) => videoService.create(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: videoKeys.all }),
  });
};

export const useUpdateVideoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ video, patch }: { video: VideoDto; patch: Partial<VideoRequest> }) =>
      videoService.update(video, patch),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: videoKeys.all }),
  });
};
