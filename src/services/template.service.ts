import { api as axiosClient } from "../api/request";
import type { Response } from "../model/Response";

export type MessageTemplate = {
  id: string;
  name: string;
  channel: "Email" | "Zalo";
  subject?: string;
  content: string;
};

const STORAGE_KEY = "shared_message_templates_cache";

const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl-1",
    name: "Lời mời hợp tác Campaign mới",
    channel: "Email",
    subject: "[WeWin] Lời mời hợp tác chiến dịch quảng cáo sản phẩm mới",
    content:
      "Xin chào KOC,\n\nThương hiệu WeWin rất ấn tượng với nội dung trên kênh của bạn! Bên mình muốn mời bạn tham gia chiến dịch quảng bá sản phẩm mới nhất...\n\nTrân trọng,\nTeam WeWin KOC Management",
  },
  {
    id: "tpl-2",
    name: "Chào hỏi & Kết nối Zalo",
    channel: "Zalo",
    content:
      "Chào bạn, mình đến từ team WeWin KOC Management. Bên mình đang có chiến dịch hàng tiêu dùng/mỹ phẩm rất phù hợp với kênh của bạn, cho mình gửi brief hợp tác nhé!",
  },
  {
    id: "tpl-3",
    name: "Nhắc nhở gửi bài review",
    channel: "Email",
    subject: "[WeWin] Nhắc nhở tiến độ đăng bài review chiến dịch",
    content:
      "Chào KOC,\n\nĐây là email nhắc nhở về deadline đăng bài review chiến dịch. Bạn vui lòng kiểm tra và gửi link bài đăng cho team trước 17h hôm nay nhé.\n\nCảm ơn bạn!",
  },
];

export const templateService = {
  // GET /api/templates
  list: async (channel?: "Email" | "Zalo"): Promise<MessageTemplate[]> => {
    try {
      const { data } = await axiosClient.get<Response<MessageTemplate[]>>("/api/templates", {
        params: { channel },
      });
      return data.data;
    } catch {
      // Fallback local storage or mock data when backend API is not available yet
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: MessageTemplate[] = raw ? JSON.parse(raw) : INITIAL_TEMPLATES;
      return channel ? list.filter((t) => t.channel === channel) : list;
    }
  },

  // POST /api/templates
  create: async (payload: Omit<MessageTemplate, "id">): Promise<MessageTemplate> => {
    try {
      const { data } = await axiosClient.post<Response<MessageTemplate>>("/api/templates", payload);
      return data.data;
    } catch {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: MessageTemplate[] = raw ? JSON.parse(raw) : INITIAL_TEMPLATES;
      const newTpl: MessageTemplate = {
        id: `tpl-${Date.now()}`,
        ...payload,
      };
      const updated = [newTpl, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newTpl;
    }
  },

  // DELETE /api/templates/:id
  remove: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(`/api/templates/${id}`);
    } catch {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: MessageTemplate[] = raw ? JSON.parse(raw) : INITIAL_TEMPLATES;
      const updated = list.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  },
};

export default templateService;
