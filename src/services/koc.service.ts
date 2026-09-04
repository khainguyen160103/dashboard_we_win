import { api as axiosClient } from "../api/request";
import type { KocDto, KocListParams, KocRequest } from "../model/Koc";
import { mapKocDtoToKoc } from "../model/Koc";
import type { Koc } from "../model/User";

// baseURL đã là `${VITE_BASE_URL}` = http://localhost:8080/api -> chỉ cần `/kocs`
// Controller: campaign-service `KocController` @RequestMapping("/api/kocs")
const BASE = "/kocs";

export type KocPage = {
  content: Koc[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

/** Gỡ lớp bọc `ApiResponse` / `PageResponse` để lấy mảng KocDto. */
const unwrapList = (data: unknown): KocDto[] => {
  const d = data as any;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const unwrapOne = (data: unknown): KocDto => {
  const d = data as any;
  return (d?.data ?? d) as KocDto;
};

export const kocService = {
  /** `GET /api/kocs` -> danh sách KOC đã map sang shape UI. */
  list: async (params?: KocListParams): Promise<Koc[]> => {
    const { data } = await axiosClient.get<unknown>(BASE, { params });
    return unwrapList(data).map(mapKocDtoToKoc);
  },

  /** Như `list` nhưng giữ lại metadata phân trang từ `PageResponse`. */
  page: async (params?: KocListParams): Promise<KocPage> => {
    const { data } = await axiosClient.get<unknown>(BASE, { params });
    const raw = ((data as any)?.data ?? data) as any;
    return {
      content: unwrapList(data).map(mapKocDtoToKoc),
      page: raw?.page ?? params?.page ?? 0,
      size: raw?.size ?? params?.size ?? 20,
      totalElements: raw?.totalElements ?? 0,
      totalPages: raw?.totalPages ?? 0,
      last: raw?.last ?? true,
    };
  },

  /** `GET /api/kocs/{id}` -> Koc (shape UI). */
  get: async (id: string): Promise<Koc> => {
    const { data } = await axiosClient.get<unknown>(`${BASE}/${id}`);
    return mapKocDtoToKoc(unwrapOne(data));
  },

  /** `GET /api/kocs/{id}` -> KocDto thô (giữ nguyên field BE). */
  getRaw: async (id: string): Promise<KocDto> => {
    const { data } = await axiosClient.get<unknown>(`${BASE}/${id}`);
    return unwrapOne(data);
  },

  /** `POST /api/kocs`. */
  create: async (payload: KocRequest): Promise<Koc> => {
    const { data } = await axiosClient.post<unknown>(BASE, payload);
    return mapKocDtoToKoc(unwrapOne(data));
  },

  /** `PUT /api/kocs/{id}`. */
  update: async (id: string, payload: Partial<KocRequest>): Promise<Koc> => {
    const { data } = await axiosClient.put<unknown>(`${BASE}/${id}`, payload);
    return mapKocDtoToKoc(unwrapOne(data));
  },

  /** `DELETE /api/kocs/{id}`. */
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`${BASE}/${id}`);
  },
};

export default kocService;
