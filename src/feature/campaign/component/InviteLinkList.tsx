import { useState } from "react";
import { Button, Input, Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FORM_SOURCES, inviteFormUrl, normalizeSource, sourceMeta } from "../model/InviteForm";

/**
 * Link form mời theo từng nền tảng (`?src=`) — gửi đúng link cho đúng nơi để biết đơn đến từ đâu.
 * `counts` = số đơn đã nhận theo nguồn (bỏ qua để ẩn cột đếm).
 */
export function InviteLinkList({ campaignId, counts }: { campaignId: string; counts?: Record<string, number> }) {
  const [customInput, setCustomInput] = useState("");
  const [customSources, setCustomSources] = useState<string[]>([]);

  // Nguồn tự đặt đã có đơn cũng hiện link để copy lại.
  const known = new Set<string>([...FORM_SOURCES.map((s) => s.key), "direct"]);
  const extra = [...new Set([...customSources, ...Object.keys(counts ?? {}).filter((k) => !known.has(k))])];
  const sources = [...FORM_SOURCES.map((s) => s.key as string), ...extra, "direct"];

  const addCustom = () => {
    const key = normalizeSource(customInput);
    if (!key) return;
    if (!sources.includes(key)) setCustomSources((prev) => [...prev, key]);
    setCustomInput("");
  };

  return (
    <div className="flex flex-col gap-2">
      {sources.map((key) => {
        const meta = sourceMeta(key);
        const url = inviteFormUrl(campaignId, key === "direct" ? undefined : key);
        return (
          <div key={key} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <Tag color={meta.color} className="!m-0 min-w-[96px] text-center">
              {meta.label}
            </Tag>
            <Typography.Text copyable={{ text: url }} className="min-w-0 flex-1 truncate font-mono text-[12.5px]">
              {url}
            </Typography.Text>
            {counts && <span className="font-mono text-[12px] text-gray-500">{counts[key] ?? 0} đơn</span>}
          </div>
        );
      })}
      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onPressEnter={addCustom}
          placeholder="Nguồn khác, VD: nhom-me-bim, kol-partner…"
          className="max-w-[320px]"
        />
        <Button icon={<PlusOutlined />} onClick={addCustom} disabled={!normalizeSource(customInput)}>
          Tạo link
        </Button>
      </div>
    </div>
  );
}
