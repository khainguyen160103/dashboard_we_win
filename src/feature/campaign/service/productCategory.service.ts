import { api as axiosClient } from "../../../api/request";

// Controller: campaign-service `ProductCategoryController` @RequestMapping("/api/product-categories")
export type ProductCategory = { id: string; name: string; description?: string | null };

const unwrapList = (data: unknown): ProductCategory[] => {
  const d = data as any;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const productCategoryService = {
  list: async (): Promise<ProductCategory[]> => {
    const { data } = await axiosClient.get<unknown>("/product-categories", { params: { page: 0, size: 200 } });
    return unwrapList(data);
  },
};

export default productCategoryService;
