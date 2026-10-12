import { api as axiosClient } from "../api/request";

export type MessageTemplate = {
  id: string;
  name: string;
  channel: "Email" | "Zalo";
  subject?: string;
  content: string;
};

// Controller: `TemplateController` @RequestMapping("/api/templates") — baseURL đã gồm "/api".
type TemplateDto = {
  id: string;
  name: string;
  title?: string;
  content: string;
  channel: "EMAIL" | "ZALO";
};

const toUi = (t: TemplateDto): MessageTemplate => ({
  id: String(t.id),
  name: t.name,
  channel: t.channel === "ZALO" ? "Zalo" : "Email",
  subject: t.title,
  content: t.content,
});

const toRequest = (t: Omit<MessageTemplate, "id">) => ({
  name: t.name,
  // BE bắt buộc `title` — Zalo không có tiêu đề nên dùng tên mẫu
  title: t.subject?.trim() || t.name,
  content: t.content,
  channel: t.channel === "Zalo" ? "ZALO" : "EMAIL",
});

const unwrapList = (data: unknown): TemplateDto[] => {
  const d = data as any;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const templateService = {
  // GET /api/templates
  list: async (channel?: "Email" | "Zalo"): Promise<MessageTemplate[]> => {
    const { data } = await axiosClient.get<unknown>("/templates", {
      params: { channel: channel ? channel.toUpperCase() : undefined, size: 200 },
    });
    return unwrapList(data).map(toUi);
  },

  // POST /api/templates
  create: async (payload: Omit<MessageTemplate, "id">): Promise<MessageTemplate> => {
    const { data } = await axiosClient.post<{ data: TemplateDto }>("/templates", toRequest(payload));
    return toUi(data.data);
  },

  // DELETE /api/templates/:id
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/templates/${id}`);
  },
};

export default templateService;
