import { useMemo, useState } from "react";
import { Alert, Button, Card, Input, Modal, Segmented, Select, Table, Typography, message } from "antd";
import type { TableColumnsType } from "antd";
import type { CampaignKocDto } from "../model/CampaignKoc";
import { useUpdateCampaignKocMutation } from "../hook/useCampaignKocQuery";
import {
  CONFIRM_DEPLOY_META,
  CONFIRM_DEPLOY_TEMPLATES,
  STEP5_REJECT_PREFIX,
  appNow,
  brandDecisionMeta,
  confirmDatesOf,
  confirmDeployEligible,
  confirmStatusOf,
  flowKey,
  resolveConfirmTemplate,
  useCampaignFlowStore,
} from "../utils/campaignFlow";
import { EmptyNote, StatGrid, StatusDot } from "./detailUi";

const { Title, Text } = Typography;

type CampaignInfo = {
  id: string;
  name: string;
  brandName?: string | null;
  pmName?: string;
  startTime?: string | Date | null;
};

function SendConfirmModal({
  campaign,
  row,
  onClose,
  onSent,
}: {
  campaign: CampaignInfo;
  row: CampaignKocDto | null;
  onClose: () => void;
  onSent: (row: CampaignKocDto, channel: "zalo" | "email") => Promise<void>;
}) {
  const [channel, setChannel] = useState<"zalo" | "email">("zalo");
  const options = CONFIRM_DEPLOY_TEMPLATES.filter((t) => t.channel === channel);
  const [tplId, setTplId] = useState(options[0].id);
  const [result, setResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const tpl = options.find((t) => t.id === tplId) ?? options[0];
  const kocName = row?.kocName ?? row?.kocUserId ?? "";
  const ctx = {
    campaignName: campaign.name,
    brand: campaign.brandName ?? "",
    kocName,
    pmName: campaign.pmName ?? "—",
  };

  const send = async () => {
    if (!row) return;
    setSending(true);
    try {
      await onSent(row, channel);
      setResult(
        `✓ Đã đánh dấu gửi thư chúc mừng qua ${channel === "email" ? "Email" : "Zalo"} cho ${kocName}. (Hệ thống chưa tự gửi tin nhắn/email — hãy gửi thủ công.)`,
      );
      setTimeout(onClose, 1400);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={Boolean(row)}
      title="Gửi thư chúc mừng & xác nhận triển khai"
      onCancel={onClose}
      afterOpenChange={(open) => {
        if (open) {
          setChannel("zalo");
          setTplId(CONFIRM_DEPLOY_TEMPLATES[0].id);
          setResult(null);
        }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="send" type="primary" loading={sending} onClick={() => void send()}>
          Gửi thư
        </Button>,
      ]}
    >
      <Text type="secondary" className="text-xs">
        {kocName} · {campaign.name}
      </Text>
      <div className="mt-4 flex flex-col gap-3">
        <Segmented
          value={channel}
          onChange={(v) => {
            const ch = v as "zalo" | "email";
            setChannel(ch);
            setTplId(CONFIRM_DEPLOY_TEMPLATES.find((t) => t.channel === ch)!.id);
          }}
          options={[
            { value: "zalo", label: "Zalo" },
            { value: "email", label: "Email" },
          ]}
        />
        <Select value={tpl.id} onChange={setTplId} options={options.map((t) => ({ value: t.id, label: t.label }))} />
        {tpl.subject && <Input readOnly value={resolveConfirmTemplate(tpl.subject, ctx)} addonBefore="Tiêu đề" />}
        <Input.TextArea readOnly autoSize={{ minRows: 7 }} value={resolveConfirmTemplate(tpl.body, ctx)} />
        {result && <Alert type="success" message={result} showIcon />}
      </div>
    </Modal>
  );
}

export function CampaignConfirmPanel({ campaign, rows }: { campaign: CampaignInfo; rows: CampaignKocDto[] }) {
  const update = useUpdateCampaignKocMutation(campaign.id);
  const letterSentAt = useCampaignFlowStore((s) => s.letterSentAt);
  const setLetterSent = useCampaignFlowStore((s) => s.setLetterSent);
  const [sendRow, setSendRow] = useState<CampaignKocDto | null>(null);
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const eligible = useMemo(() => confirmDeployEligible(rows), [rows]);
  const by = (s: ReturnType<typeof confirmStatusOf>) => eligible.filter((r) => confirmStatusOf(r) === s).length;

  const patch = async (r: CampaignKocDto, payload: Parameters<typeof update.mutateAsync>[0]["payload"], ok: string) => {
    try {
      await update.mutateAsync({ kocUserId: r.kocUserId, payload });
      message.success(ok);
    } catch {
      message.error("Không cập nhật được trạng thái xác nhận cuối");
      throw new Error("update failed");
    }
  };

  const columns: TableColumnsType<CampaignKocDto> = [
    { title: "KOC", key: "koc", render: (_, r) => <span className="font-bold">{r.kocName ?? r.kocUserId}</span> },
    {
      title: "Ngành hàng",
      key: "cat",
      render: (_, r) => r.kocProductCategoryId || "Chưa phân loại — cần bổ sung",
    },
    {
      title: "Brand duyệt",
      key: "brand",
      render: (_, r) => {
        const m = brandDecisionMeta(r);
        return <StatusDot tone={m.tone}>{m.label}</StatusDot>;
      },
    },
    {
      title: "Trạng thái xác nhận cuối",
      key: "status",
      render: (_, r) => {
        const m = CONFIRM_DEPLOY_META[confirmStatusOf(r)];
        return <StatusDot tone={m.tone}>{m.label}</StatusDot>;
      },
    },
    {
      title: "Ngày gửi thư",
      key: "sent",
      render: (_, r) => <span className="font-mono">{confirmDatesOf(campaign, r, letterSentAt[flowKey(r)]).sent}</span>,
    },
    {
      title: "Ngày xác nhận",
      key: "confirmed",
      render: (_, r) => (
        <span className="font-mono">{confirmDatesOf(campaign, r, letterSentAt[flowKey(r)]).confirmed}</span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, r) => {
        const status = confirmStatusOf(r);
        if (status === "chua_gui")
          return (
            <Button type="primary" size="small" onClick={() => setSendRow(r)}>
              Gửi thư chúc mừng
            </Button>
          );
        if (status === "da_gui_thu") {
          const key = flowKey(r);
          return (
            <div className="flex min-w-[220px] flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="primary"
                  size="small"
                  loading={update.isPending && update.variables?.kocUserId === r.kocUserId}
                  onClick={() =>
                    void patch(r, { status: "CONFIRMED" }, `${r.kocName} đã xác nhận cuối — chính thức tham gia`).catch(() => {})
                  }
                >
                  Xác nhận đồng ý
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setRejectOpen(key);
                    setRejectReason("");
                  }}
                >
                  Từ chối
                </Button>
              </div>
              {rejectOpen === key && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                  <Input.TextArea
                    autoFocus
                    rows={2}
                    placeholder="Ghi rõ lý do KOC từ chối…"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="small"
                      type="primary"
                      disabled={!rejectReason.trim()}
                      onClick={() =>
                        void patch(
                          r,
                          { status: "REJECTED", rejectReason: `${STEP5_REJECT_PREFIX}${rejectReason.trim()}` },
                          `Đã ghi nhận ${r.kocName} từ chối`,
                        )
                          .then(() => setRejectOpen(null))
                          .catch(() => {})
                      }
                    >
                      Xác nhận từ chối
                    </Button>
                    <Button size="small" onClick={() => setRejectOpen(null)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        }
        if (status === "tu_choi") {
          const reason = r.rejectReason?.replace(STEP5_REJECT_PREFIX, "");
          return reason ? <span className="text-xs text-gray-500">{reason}</span> : <span className="text-gray-300">—</span>;
        }
        return <span className="text-gray-300">—</span>;
      },
    },
  ];

  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm">
      <Title level={5} className="!mb-0 !text-[14.5px]">
        Xác nhận &amp; Triển khai
      </Title>
      <Text type="secondary" className="text-xs">
        Bước 5 (cuối) trước khi chính thức triển khai — chỉ hiện KOC đã qua Sơ duyệt = Duyệt VÀ Brand duyệt = Final,
        đang chờ Wewin gửi thư chúc mừng &amp; xác nhận lại với KOC trước khi bắt đầu gửi hàng mẫu.
      </Text>

      <div className="mb-[18px] mt-4">
        <StatGrid
          cols={4}
          items={[
            { t: "Tổng KOC chờ xác nhận", v: String(eligible.length), note: "Đã qua Sơ duyệt + Brand duyệt Final" },
            { t: "Đã gửi thư", v: String(by("da_gui_thu")) },
            { t: "Đã xác nhận", v: String(by("da_xac_nhan")) },
            { t: "Từ chối", v: String(by("tu_choi")) },
          ]}
        />
      </div>

      {eligible.length === 0 ? (
        <EmptyNote>Chưa có KOC nào qua đủ Sơ duyệt = Duyệt + Brand duyệt = Final để chờ xác nhận cuối.</EmptyNote>
      ) : (
        <Table<CampaignKocDto>
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={eligible}
          scroll={{ x: "max-content" }}
          pagination={eligible.length > 20 ? { pageSize: 20 } : false}
        />
      )}

      <SendConfirmModal
        campaign={campaign}
        row={sendRow}
        onClose={() => setSendRow(null)}
        onSent={async (r, channel) => {
          await patch(
            r,
            { status: "DEALING", notes: `Đã gửi thư chúc mừng qua ${channel === "email" ? "Email" : "Zalo"}` },
            `Đã gửi thư chúc mừng cho ${r.kocName}`,
          );
          setLetterSent(flowKey(r), appNow().toISOString());
        }}
      />
    </Card>
  );
}
