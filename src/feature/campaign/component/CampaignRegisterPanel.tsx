import { useMemo, useState } from "react";
import { Button, Card, Select, Table, Tag, Tooltip, Typography, message } from "antd";
import type { TableColumnsType } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { CampaignKocDto } from "../model/CampaignKoc";
import { useUpdateCampaignKocMutation } from "../hook/useCampaignKocQuery";
import { useInviteFormQuery, useInviteFormSubmissionsQuery } from "../hook/useInviteFormQuery";
import {
  GMV_CHECK_META,
  kenhNguonMeta,
  REGISTER_SCREEN_META,
  SCREEN_REJECT_PREFIX,
  SCREENING_TO_STATUS,
  buildRegistrations,
  flowKey,
  fmtNum,
  fmtVNDFull,
  useCampaignFlowStore,
  type GmvCheck,
  type KenhNguon,
  type Registration,
  type Screening,
} from "../utils/campaignFlow";
import { EmptyNote, StatGrid, StatusDot } from "./detailUi";

const { Title, Text } = Typography;

const th = (label: string, tip?: string) =>
  tip ? (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip title={tip}>
        <InfoCircleOutlined className="text-gray-400" />
      </Tooltip>
    </span>
  ) : (
    label
  );

const orDash = (v?: string | null | false) => (v ? v : <span className="text-gray-300">—</span>);

const fmtAnswer = (v: unknown) => {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
};

const SCREEN_FILTER = [
  { value: "all", label: "Trạng thái: Tất cả" },
  ...(["pending", "approve", "consider", "reject"] as Screening[]).map((v) => ({ value: v, label: REGISTER_SCREEN_META[v].label })),
];
export function CampaignRegisterPanel({
  campaign,
  rows,
}: {
  campaign: { id: string; name: string; startTime?: string | Date | null };
  rows: CampaignKocDto[];
}) {
  const [kenhFilter, setKenhFilter] = useState<"all" | KenhNguon>("all");
  // Mặc định ưu tiên "Chờ duyệt" — đúng nhóm Vận hành cần xử lý trước.
  const [screenFilter, setScreenFilter] = useState<"all" | Screening>("pending");
  const [approveOpen, setApproveOpen] = useState<string | null>(null);
  const gmvCheck = useCampaignFlowStore((s) => s.gmvCheck);
  const setGmvCheck = useCampaignFlowStore((s) => s.setGmvCheck);
  const update = useUpdateCampaignKocMutation(campaign.id);
  const { data: submissions } = useInviteFormSubmissionsQuery(campaign.id);
  const { data: inviteForm } = useInviteFormQuery(campaign.id);
  const customFields = inviteForm?.customFields ?? [];

  const registrations = useMemo(() => buildRegistrations(rows, submissions), [rows, submissions]);
  // Bộ lọc kênh = các nguồn đang có trong dữ liệu (facebook, zalo, dashboard...)
  const kenhOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả kênh" },
      ...[...new Set(registrations.map((r) => r.kenhNguon))].map((k) => ({ value: k, label: kenhNguonMeta(k).label })),
    ],
    [registrations],
  );
  const gmvOf = (reg: Registration): GmvCheck => gmvCheck[flowKey(reg.row)] ?? "pending";

  const count = (s: Screening) => registrations.filter((r) => r.screening === s).length;
  const total = registrations.length;
  const filtered = registrations.filter(
    (r) => (kenhFilter === "all" || r.kenhNguon === kenhFilter) && (screenFilter === "all" || r.screening === screenFilter),
  );

  const decide = async (reg: Registration, screening: Screening) => {
    try {
      await update.mutateAsync({
        kocUserId: reg.row.kocUserId,
        payload: {
          status: SCREENING_TO_STATUS[screening],
          ...(screening === "reject" ? { rejectReason: `${SCREEN_REJECT_PREFIX}Loại ở bước Sơ duyệt` } : {}),
        },
      });
      setApproveOpen(null);
      message.success(
        screening === "approve"
          ? `Đã Duyệt ${reg.fullName} — KOC xuất hiện ở "Danh sách KOC chờ duyệt" bên Dashboard Cổng Brand`
          : `Sơ duyệt ${reg.fullName}: ${REGISTER_SCREEN_META[screening].label}`,
      );
    } catch {
      message.error("Không cập nhật được Sơ duyệt");
    }
  };

  const columns: TableColumnsType<Registration> = [
    { title: "Dấu thời gian", key: "ts", render: (_, r) => orDash(r.submittedAt && new Date(r.submittedAt).toLocaleString("vi-VN")) },
    { title: "SĐT / Zalo", key: "zalo", render: (_, r) => orDash(r.zalo) },
    { title: "Họ và tên", dataIndex: "fullName", key: "name", render: (v) => <span className="font-bold">{v}</span> },
    {
      title: "Kênh đăng ký",
      key: "kenh",
      render: (_, r) => <Tag color={kenhNguonMeta(r.kenhNguon).color}>{kenhNguonMeta(r.kenhNguon).label}</Tag>,
    },
    {
      title: th("Link kênh TikTok", "Gắn Affiliate"),
      key: "link",
      render: (_, r) =>
        r.channelLink ? (
          <a
            href={/^https?:\/\//.test(r.channelLink) ? r.channelLink : `https://${r.channelLink}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {r.channelLink.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          orDash(null)
        ),
    },
    { title: "ID kênh TikTok", key: "cid", render: (_, r) => orDash(r.channelId) },
    {
      title: th("Số lượng follower hiện tại", "Ghi số chi tiết, VD ghi là 20.000 — không ghi tắt 20k"),
      key: "fl",
      align: "right",
      render: (_, r) => <span className="font-mono">{fmtNum(r.followers)}</span>,
    },
    {
      title: th("GMV kênh", "30 ngày gần nhất. Ghi số chi tiết, VD ghi là 20.000.000 — không ghi tắt 20M"),
      key: "gmv",
      align: "right",
      render: (_, r) => <span className="font-mono">{fmtVNDFull(r.gmv30)}</span>,
    },
    { title: "Email", key: "email", render: (_, r) => orDash(r.email) },
    {
      title: th(
        "Địa chỉ nhận sản phẩm mẫu",
        "ĐỊA CHỈ CŨ — ghi rõ ràng, chính xác theo thứ tự: Số nhà - Thôn/Xóm - Phường/Xã - Quận/Huyện - Tỉnh",
      ),
      key: "addr",
      render: (_, r) => orDash(r.address),
    },
    {
      title: "GMV check",
      key: "gmvcheck",
      render: (_, r) => (
        <Select<GmvCheck>
          size="small"
          className="min-w-[230px]"
          value={gmvOf(r)}
          onChange={(v) => setGmvCheck(flowKey(r.row), v)}
          options={(Object.keys(GMV_CHECK_META) as GmvCheck[]).map((k) => ({
            value: k,
            label: <StatusDot tone={GMV_CHECK_META[k].tone}>{GMV_CHECK_META[k].label}</StatusDot>,
          }))}
        />
      ),
    },
    {
      title: th(
        "Sơ duyệt",
        "4 tùy chọn: Chờ duyệt (mặc định), Duyệt (cần GMV Check khớp trước, có bước Xác nhận riêng), Loại, Cân nhắc",
      ),
      key: "screening",
      render: (_, r) => {
        const gmvOk = gmvOf(r) === "matched";
        const key = flowKey(r.row);
        return (
          <div className="flex min-w-[200px] flex-col gap-2">
            <Select<Screening>
              size="small"
              value={r.screening}
              loading={update.isPending && update.variables?.kocUserId === r.row.kocUserId}
              onChange={(v) => (v === "approve" ? setApproveOpen(key) : void decide(r, v))}
              options={[
                {
                  value: "approve",
                  disabled: !gmvOk,
                  label: (
                    <Tooltip title={gmvOk ? undefined : 'Cần đối chiếu GMV Check = "Đã đối chiếu — khớp" trước khi Duyệt'}>
                      <StatusDot tone="good">Duyệt</StatusDot>
                    </Tooltip>
                  ),
                },
                { value: "pending", label: <StatusDot tone="muted">Chờ duyệt</StatusDot> },
                { value: "reject", label: <StatusDot tone="crit">Loại</StatusDot> },
                { value: "consider", label: <StatusDot tone="warn">Cân nhắc</StatusDot> },
              ]}
            />
            {approveOpen === key && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                <div className="text-[12.5px] leading-snug text-gray-700">
                  Xác nhận Duyệt KOC này — KOC sẽ xuất hiện ở "Danh sách KOC chờ duyệt" bên Dashboard Cổng Brand.
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="small" type="primary" loading={update.isPending} onClick={() => void decide(r, "approve")}>
                    ✓ Xác nhận Duyệt
                  </Button>
                  <Button size="small" onClick={() => setApproveOpen(null)}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Note",
      key: "note",
      render: (_, r) => (r.note ? r.note : <span className="text-gray-300">—</span>),
    },
  ];

  const emptyText = (() => {
    const parts: string[] = [];
    if (kenhFilter !== "all") parts.push(`kênh "${kenhNguonMeta(kenhFilter).label}"`);
    if (screenFilter !== "all") parts.push(`trạng thái "${REGISTER_SCREEN_META[screenFilter].label}"`);
    return `Không có đơn đăng ký nào khớp ${parts.join(" và ")}.`;
  })();

  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm">
      <Title level={5} className="!mb-0 !text-[14.5px]">
        Danh sách KOC Đăng ký
      </Title>
      <Text type="secondary" className="text-xs">
        Toàn bộ đơn đăng ký KOC nộp qua Form cho chiến dịch này — dữ liệu thô để Sơ duyệt trước khi đưa vào "Danh
        sách mời KOC". Tham khảo Sheet đăng ký gốc Sếp gửi để đối chiếu định dạng trường.
      </Text>

      <div className="mb-[18px] mt-4">
        <StatGrid
          cols={5}
          items={[
            { t: "Tổng đơn đăng ký", v: String(total) },
            { t: "Sơ duyệt: Chờ duyệt", v: String(count("pending")) },
            {
              t: "Sơ duyệt: Duyệt",
              v: String(count("approve")),
              note: total ? `${Math.round((count("approve") / total) * 100)}% tổng đơn` : "—",
            },
            { t: "Sơ duyệt: Cân nhắc", v: String(count("consider")) },
            { t: "Sơ duyệt: Loại", v: String(count("reject")) },
          ]}
        />
      </div>

      <div className="mb-3.5 flex flex-wrap gap-2">
        <Select className="min-w-[160px]" value={kenhFilter} onChange={setKenhFilter} options={kenhOptions} />
        <Select className="min-w-[180px]" value={screenFilter} onChange={setScreenFilter} options={SCREEN_FILTER} />
      </div>

      {total === 0 ? (
        <EmptyNote>Chiến dịch này chưa có đơn đăng ký KOC nào.</EmptyNote>
      ) : filtered.length === 0 ? (
        <EmptyNote>{emptyText}</EmptyNote>
      ) : (
        <Table<Registration>
          size="middle"
          rowKey={(r) => r.row.id}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: "max-content" }}
          pagination={filtered.length > 20 ? { pageSize: 20 } : false}
          expandable={
            customFields.length
              ? {
                  rowExpandable: (r) => Object.keys(r.customAnswers).length > 0,
                  expandedRowRender: (r) => (
                    <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      {customFields.map((f) => (
                        <div key={f.key}>
                          <dt className="text-xs font-semibold text-gray-500">{f.label}</dt>
                          <dd className="m-0 text-[13px]">{fmtAnswer(r.customAnswers[f.key])}</dd>
                        </div>
                      ))}
                    </dl>
                  ),
                }
              : undefined
          }
        />
      )}
    </Card>
  );
}
