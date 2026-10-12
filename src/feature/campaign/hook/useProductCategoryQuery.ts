import { useQuery } from "@tanstack/react-query";
import productCategoryService from "../service/productCategory.service";

export const useProductCategoriesQuery = () =>
  useQuery({
    queryKey: ["productCategories", "list"],
    queryFn: () => productCategoryService.list(),
    staleTime: 1000 * 60 * 10,
  });
