import { api as axiosClient } from "../../../api/request";
import type { KocDto, KocListParams, KocRequest, KocView as Koc } from "../model/Koc";
import { mapKocDtoToKoc } from "../model/Koc";

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

/**
 * `GET /kocs` trả về:
 *   { success, message, data: { data: KocDto[], page, size, totalElements, totalPages, last } }
 * -> mảng nằm ở `data.data`, metadata phân trang nằm ở `data`.
 * Vẫn nhận các biến thể cũ (`data.content`, `content`, mảng trần) cho chắc.
 */
const unwrapList = (data: unknown): KocDto[] => {
  const d = data as any;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

/** Object chứa metadata phân trang (`page`, `size`, `totalElements`…). */
const pageMetaOf = (data: unknown) => {
  const d = data as any;
  return (d?.data && !Array.isArray(d.data) ? d.data : d) ?? {};
};

const unwrapOne = (data: unknown): KocDto => {
  const d = data as any;
  return (d?.data ?? d) as KocDto;
};

export const kocService = {
  /** `GET /kocs` -> 1 trang KOC (mặc định BE trả 20 dòng) đã map sang shape UI. */
  list: async (params?: KocListParams): Promise<Koc[]> => {
    const { data } = await axiosClient.get<unknown>(BASE, { params });
    return unwrapList(data).map(mapKocDtoToKoc);
  },

  /** Như `list` nhưng kèm metadata phân trang — dùng cho bảng có phân trang server. */
  page: async (params?: KocListParams): Promise<KocPage> => {
    const { data } = await axiosClient.get<unknown>(BASE, { params });
    const meta = pageMetaOf(data);
    const content = unwrapList(data).map(mapKocDtoToKoc);
    return {
      content,
      page: meta.page ?? params?.page ?? 0,
      size: meta.size ?? params?.size ?? content.length,
      totalElements: meta.totalElements ?? content.length,
      totalPages: meta.totalPages ?? 1,
      last: meta.last ?? true,
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
