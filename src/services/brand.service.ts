import { api as axiosClient } from "../api/request";
import type { BrandDto, BrandListParams, BrandRequest } from "../model/Brand";
import { mapBrandDtoToBrand } from "../model/Brand";
import type { Brand } from "../components/brand/types";

// baseURL = `${VITE_BASE_URL}` (http://localhost:8080/api) -> chỉ cần `/brands`.
// Controller: campaign-service `BrandController` @RequestMapping("/api/brands")
const BASE = "/brands";

export type BrandPage = {
  content: Brand[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

/** Gỡ lớp bọc `ApiResponse` / `PageResponse` để lấy mảng BrandDto. */
const unwrapList = (data: unknown): BrandDto[] => {
  const d = data as any;
  if (Array.isArray(d)) return d;
  // BE: ApiResponse<PageResponse<T>> = { data: { data: [...], page, size, ... } }
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const unwrapOne = (data: unknown): BrandDto => {
  const d = data as any;
  return (d?.data ?? d) as BrandDto;
};

export const brandService = {
  /** `GET /api/brands` -> danh sách brand đã map sang shape UI. */
  list: async (params?: BrandListParams): Promise<Brand[]> => {
    const { data } = await axiosClient.get<unknown>(BASE, { params });
    return unwrapList(data).map(mapBrandDtoToBrand);
  },

  /** Như `list` nhưng giữ metadata phân trang từ `PageResponse`. */
  page: async (params?: BrandListParams): Promise<BrandPage> => {
    const { data } = await axiosClient.get<unknown>(BASE, { params });
    const raw = ((data as any)?.data ?? data) as any;
    return {
      content: unwrapList(data).map(mapBrandDtoToBrand),
      page: raw?.page ?? params?.page ?? 0,
      size: raw?.size ?? params?.size ?? 20,
      totalElements: raw?.totalElements ?? 0,
      totalPages: raw?.totalPages ?? 0,
      last: raw?.last ?? true,
    };
  },

  /** `GET /api/brands/{id}`. */
  get: async (id: string | number): Promise<Brand> => {
    const { data } = await axiosClient.get<unknown>(`${BASE}/${id}`);
    return mapBrandDtoToBrand(unwrapOne(data));
  },

  /** `POST /api/brands`. */
  create: async (payload: BrandRequest): Promise<Brand> => {
    const { data } = await axiosClient.post<unknown>(BASE, payload);
    return mapBrandDtoToBrand(unwrapOne(data));
  },

  /** `PUT /api/brands/{id}`. */
  update: async (id: string | number, payload: Partial<BrandRequest>): Promise<Brand> => {
    const { data } = await axiosClient.put<unknown>(`${BASE}/${id}`, payload);
    return mapBrandDtoToBrand(unwrapOne(data));
  },

  /** `DELETE /api/brands/{id}`. */
  remove: async (id: string | number): Promise<void> => {
    await axiosClient.delete(`${BASE}/${id}`);
  },
};

export default brandService;
