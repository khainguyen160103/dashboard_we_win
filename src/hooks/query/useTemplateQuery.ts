import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import templateService from "../../services/template.service";
import type { MessageTemplate } from "../../services/template.service";

export const templateQueryKeys = {
  all: ["templates"] as const,
  list: (channel?: "Email" | "Zalo") => [...templateQueryKeys.all, channel] as const,
};

export const useTemplatesQuery = (channel?: "Email" | "Zalo") =>
  useQuery({
    queryKey: templateQueryKeys.list(channel),
    queryFn: () => templateService.list(channel),
  });

export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<MessageTemplate, "id">) => templateService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateQueryKeys.all });
    },
  });
};

export const useDeleteTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateQueryKeys.all });
    },
  });
};
