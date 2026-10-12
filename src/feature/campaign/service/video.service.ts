import { api as axiosClient } from "../../../api/request";
import type { VideoDto, VideoListParams, VideoRequest } from "../model/Video";

// Controller: campaign-service `VideoController` @RequestMapping("/api/videos")
const unwrapList = (data: unknown): VideoDto[] => {
  const d = data as any;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const unwrapOne = (data: unknown): VideoDto => {
  const d = data as any;
  return (d?.data ?? d) as VideoDto;
};

/** Bỏ các field chỉ-đọc trước khi PUT (BE nhận nguyên `VideoRequest`). */
const toRequest = (v: VideoDto): VideoRequest => ({
  campaignId: v.campaignId,
  kocUserId: v.kocUserId,
  nameVideo: v.nameVideo,
  status: v.status,
  link: v.link,
  rating: v.rating,
  timeUpload: v.timeUpload,
  pmUserId: v.pmUserId,
  brandUserId: v.brandUserId,
  approveBy: v.approveBy,
  note: v.note,
});

export const videoService = {
  list: async (params?: VideoListParams): Promise<VideoDto[]> => {
    const { data } = await axiosClient.get<unknown>("/videos", {
      params: { ...params, page: 0, size: 500 },
    });
    return unwrapList(data);
  },

  create: async (payload: VideoRequest): Promise<VideoDto> => {
    const { data } = await axiosClient.post<unknown>("/videos", payload);
    return unwrapOne(data);
  },

  /** Cập nhật một phần — gộp với bản hiện có vì PUT yêu cầu campaignId + status. */
  update: async (video: VideoDto, patch: Partial<VideoRequest>): Promise<VideoDto> => {
    const { data } = await axiosClient.put<unknown>(`/videos/${video.id}`, {
      ...toRequest(video),
      ...patch,
    });
    return unwrapOne(data);
  },
};

export default videoService;
