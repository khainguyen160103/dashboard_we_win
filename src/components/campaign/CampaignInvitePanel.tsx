import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  useAvailableKocsQuery,
  useCampaignKocsQuery,
  useInviteKocsMutation,
  useRemoveCampaignKocMutation,
} from "../../hooks/query/useCampaignKocQuery";
import {
  CAMPAIGN_KOC_STATUS_LABEL,
  type CampaignKocDto,
  type CampaignKocStatus,
} from "../../model/CampaignKoc";
import { formatDate } from "../../utils/formatDate";
import { MOCK_CAMPAIGN_KOCS, withFallback } from "../../pages/Dashboard/mockData";

const { Title, Text } = Typography;

// ─── Pipeline: gộp 9 trạng thái BE thành 4 nhóm như demo ─────────────────────
type Stage = "waiting" | "dealing" | "confirmed" | "declined";

const STAGE_OF: Record<CampaignKocStatus, Stage> = {
  INVITED: "waiting",
  REGISTERED: "waiting",
  WEWIN_REVIEW: "dealing",
  BRAND_REVIEW: "dealing",
  APPROVED: "dealing",
  DEALING: "dealing",
  CONFIRMED: "confirmed",
  THANKED: "confirmed",
  REJECTED: "declined",
};

const STAGE_LABEL: Record<Stage, string> = {
  waiting: "Chờ phản hồi",
  dealing: "Đang deal giá",
  confirmed: "Xác nhận tham gia",
  declined: "Từ chối",
};

const STAGE_COLOR: Record<Stage, string> = {
  waiting: "gold",
  dealing: "blue",
  confirmed: "green",
  declined: "red",
};

const PREVIEW_PRIORITY: Record<Stage, number> = {
  waiting: 0,
  declined: 1,
  dealing: 2,
  confirmed: 3,
};

const fmtVnd = (n?: number | null) =>
  n === undefined || n === null ? "—" : `${new Intl.NumberFormat("vi-VN").format(n)} đ`;

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const stageOf = (r: CampaignKocDto) => STAGE_OF[r.status] ?? "waiting";

// ════════════════════════════════════════════════════════════════════════════
// Panel: card "Danh sách mời KOC" cho 1 campaign (dùng lại trong tab & chi tiết)
// ════════════════════════════════════════════════════════════════════════════
export function CampaignInvitePanel({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName?: string;
}) {
  const query = useCampaignKocsQuery(campaignId);
  const { isLoading, isError } = query;
  const [progressKoc, setProgressKoc] = useState<CampaignKocDto | null>(null);
  const [fullOpen, setFullOpen] = useState(false);

  const { rows, usingMock } = useMemo(
    () => withFallback<CampaignKocDto>(query, MOCK_CAMPAIGN_KOCS),
    [query.data, query.isError, query.isLoading],
  );

  const stats = useMemo(() => {
    const by = (s: Stage) => rows.filter((r) => stageOf(r) === s).length;
    return {
      total: rows.length,
      confirmed: by("confirmed"),
      waiting: by("waiting"),
      declined: by("declined"),
    };
  }, [rows]);

  const preview = useMemo(
    () =>
      [...rows]
        .sort((a, b) => {
          const pa = PREVIEW_PRIORITY[stageOf(a)];
          const pb = PREVIEW_PRIORITY[stageOf(b)];
          if (pa !== pb) return pa - pb;
          return (b.invitedAt ?? "").localeCompare(a.invitedAt ?? "");
        })
        .slice(0, 5),
    [rows],
  );

  const columns: TableColumnsType<CampaignKocDto> = [
    {
      title: "KOC",
      key: "koc",
      render: (_, r) => <span className="font-medium text-gray-900">{r.kocName ?? r.kocUserId}</span>,
    },
    { title: "Tier", key: "tier", width: 100, render: (_, r) => r.kocTier || "—" },
    {
      title: "Trạng thái mời",
      key: "status",
      width: 170,
      render: (_, r) => (
        <Tag color={STAGE_COLOR[stageOf(r)]}>{CAMPAIGN_KOC_STATUS_LABEL[r.status]}</Tag>
      ),
    },
    {
      title: "PM phụ trách",
      key: "pm",
      width: 150,
      render: (_, r) => r.pmUserId || "—",
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "right",
      render: (_, r) => (
        <Button type="link" className="!px-0" onClick={() => setProgressKoc(r)}>
          Chi tiết →
        </Button>
      ),
    },
  ];

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <Title level={5} className="!mb-0">
        Danh sách mời KOC{" "}
        {usingMock && (
          <Tag color="gold" className="align-middle text-xs">
            Dữ liệu minh hoạ
          </Tag>
        )}
      </Title>
      <Text type="secondary" className="text-xs">
        Theo dõi tiến độ mời từng KOC như một CRM — từ lúc gửi lời mời đến khi xác nhận tham
        gia. Bấm "Chi tiết" để xem đầy đủ mốc liên hệ.
      </Text>

      {isError && !usingMock ? (
        <Empty className="py-10" description="Không tải được danh sách mời KOC" />
      ) : (
        <Spin spinning={isLoading}>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Tổng lời mời đã gửi" value={String(stats.total)} />
            <StatTile
              label="Đã xác nhận"
              value={String(stats.confirmed)}
              tone="text-green-600"
              sub={
                stats.total
                  ? `${Math.round((stats.confirmed / stats.total) * 100)}% tổng lời mời`
                  : undefined
              }
            />
            <StatTile
              label="Đang chờ phản hồi"
              value={String(stats.waiting)}
              tone="text-amber-500"
            />
            <StatTile label="Từ chối" value={String(stats.declined)} tone="text-red-500" />
          </div>

          <Table<CampaignKocDto>
            className="mt-4"
            columns={columns}
            dataSource={preview}
            rowKey="id"
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa mời KOC nào" }}
          />

          {rows.length > preview.length && (
            <div className="mt-3 text-right">
              <Button type="link" className="!px-0" onClick={() => setFullOpen(true)}>
                Chi tiết (xem toàn bộ {rows.length} KOC) →
              </Button>
            </div>
          )}
        </Spin>
      )}

      <InviteProgressModal koc={progressKoc} onClose={() => setProgressKoc(null)} />

      <InvitePipelineModal
        open={fullOpen}
        onClose={() => setFullOpen(false)}
        campaignId={campaignId}
        campaignName={campaignName}
        rows={rows}
      />
    </Card>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold text-gray-900 ${tone ?? ""}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: Tiến độ mời — 1 KOC (timeline suy ra từ status + mốc thời gian BE)
// ════════════════════════════════════════════════════════════════════════════
function InviteProgressModal({
  koc,
  onClose,
}: {
  koc: CampaignKocDto | null;
  onClose: () => void;
}) {
  const stage = koc ? stageOf(koc) : "waiting";
  const invited = koc?.invitedAt ?? koc?.createdAt;
  const updated = koc?.statusUpdatedAt ?? koc?.updatedAt;

  const items = koc
    ? [
        {
          color: "blue",
          children: (
            <>
              <div className="font-medium text-gray-900">Gửi lời mời qua Zalo / Email</div>
              <Text type="secondary" className="text-xs">
                {formatDate(invited)}
              </Text>
            </>
          ),
        },
        ...(stage === "waiting"
          ? [
              {
                color: "gray",
                children: (
                  <div className="font-medium text-gray-500">
                    Đã gửi — chờ KOC phản hồi
                  </div>
                ),
              },
            ]
          : [
              {
                color: "blue",
                children: (
                  <>
                    <div className="font-medium text-gray-900">KOC phản hồi quan tâm</div>
                    <Text type="secondary" className="text-xs">
                      {formatDate(updated)}
                    </Text>
                  </>
                ),
              },
            ]),
        ...(stage === "dealing"
          ? [
              {
                color: "blue",
                children: (
                  <div className="font-medium text-blue-600">
                    Đang trao đổi brief / deal giá Cast
                  </div>
                ),
              },
            ]
          : []),
        ...(stage === "confirmed"
          ? [
              {
                color: "green",
                children: (
                  <>
                    <div className="font-medium text-green-600">
                      Xác nhận tham gia chiến dịch
                    </div>
                    <Text type="secondary" className="text-xs">
                      {formatDate(updated)}
                    </Text>
                  </>
                ),
              },
            ]
          : []),
        ...(stage === "declined"
          ? [
              {
                color: "red",
                children: (
                  <div className="font-medium text-red-600">
                    Từ chối tham gia
                    {koc.rejectReason ? ` — ${koc.rejectReason}` : ""}
                  </div>
                ),
              },
            ]
          : []),
      ]
    : [];

  return (
    <Modal
      open={koc !== null}
      onCancel={onClose}
      footer={null}
      width={520}
      title={koc ? `Tiến độ mời — ${koc.kocName ?? koc.kocUserId}` : "Tiến độ mời"}
    >
      {koc && (
        <>
          <div className="mb-4 text-sm text-gray-500">
            {koc.kocTier || "—"} · Phụ trách: {koc.pmUserId || "—"} ·{" "}
            <Tag color={STAGE_COLOR[stage]}>{CAMPAIGN_KOC_STATUS_LABEL[koc.status]}</Tag>
          </div>
          <Timeline items={items} />
        </>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: Danh sách mời KOC — xem toàn bộ (pipeline + đàm phán Cast)
// ════════════════════════════════════════════════════════════════════════════
function InvitePipelineModal({
  open,
  onClose,
  campaignId,
  campaignName,
  rows,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName?: string;
  rows: CampaignKocDto[];
}) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [poolOpen, setPoolOpen] = useState(false);
  const removeMutation = useRemoveCampaignKocMutation(campaignId);

  const summary = useMemo(() => {
    const by = (s: Stage) => rows.filter((r) => stageOf(r) === s);
    const confirmed = by("confirmed");
    return {
      total: rows.length,
      confirmed: confirmed.length,
      dealing: by("dealing").length,
      declined: by("declined").length,
      totalCast: confirmed.reduce((s, r) => s + (r.finalCast ?? 0), 0),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchStage = stageFilter === "all" || stageOf(r) === stageFilter;
      const matchSearch = !q || (r.kocName ?? "").toLowerCase().includes(q);
      return matchStage && matchSearch;
    });
  }, [rows, search, stageFilter]);

  const handleRemove = (r: CampaignKocDto) => {
    Modal.confirm({
      title: `Gỡ ${r.kocName ?? "KOC"} khỏi chiến dịch?`,
      okText: "Gỡ",
      okButtonProps: { danger: true },
      cancelText: "Huỷ",
      onOk: async () => {
        await removeMutation.mutateAsync(r.kocUserId);
        message.success("Đã gỡ KOC khỏi chiến dịch");
      },
    });
  };

  const columns: TableColumnsType<CampaignKocDto> = [
    {
      title: "KOC",
      key: "koc",
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Avatar size={32} className="shrink-0 bg-blue-100 text-blue-700 font-semibold">
            {initials(r.kocName)}
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-gray-900">{r.kocName ?? r.kocUserId}</div>
            {r.kocIdTiktok && (
              <div className="text-xs text-gray-400">{r.kocIdTiktok}</div>
            )}
          </div>
        </div>
      ),
    },
    { title: "Tier", key: "tier", width: 110, render: (_, r) => r.kocTier || "—" },
    {
      title: "Có Cast?",
      key: "hasCast",
      width: 100,
      render: (_, r) =>
        r.hasCast ? <Tag color="blue">Có Cast</Tag> : <Text type="secondary">0 Cast</Text>,
    },
    {
      title: "Cast mong muốn / Chốt",
      key: "cast",
      width: 200,
      render: (_, r) =>
        r.hasCast ? (
          <div className="text-xs">
            <div>Đề xuất: {fmtVnd(r.desiredCast)}</div>
            <div className="font-medium text-gray-900">
              Chốt: {r.finalCast ? fmtVnd(r.finalCast) : "Chưa chốt"}
            </div>
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Trạng thái Pipeline",
      key: "pipeline",
      width: 190,
      render: (_, r) => {
        const s = stageOf(r);
        return (
          <div>
            <Tag color={STAGE_COLOR[s]}>{STAGE_LABEL[s]}</Tag>
            {r.rejectReason && (
              <div className="mt-1 text-xs text-red-500">{r.rejectReason}</div>
            )}
            <div className="mt-1 text-xs text-gray-400">
              {CAMPAIGN_KOC_STATUS_LABEL[r.status]}
            </div>
          </div>
        );
      },
    },
    {
      title: "",
      key: "remove",
      width: 60,
      align: "center",
      render: (_, r) => (
        <Button
          size="small"
          type="text"
          danger
          loading={removeMutation.isPending}
          onClick={() => handleRemove(r)}
        >
          ✕
        </Button>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1080}
      title={
        <div>
          <div className="text-base font-semibold">Danh sách mời KOC</div>
          <div className="text-xs font-normal text-gray-400">
            {[campaignName, `${summary.total} KOC được mời`].filter(Boolean).join(" · ")}
          </div>
        </div>
      }
    >
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="KOC Đã Mời" value={String(summary.total)} />
        <StatTile
          label="Đã Xác Nhận"
          value={String(summary.confirmed)}
          tone="text-green-600"
        />
        <StatTile
          label="Đang Duyệt / Deal"
          value={String(summary.dealing)}
          tone="text-blue-600"
        />
        <StatTile label="Bị Từ Chối" value={String(summary.declined)} tone="text-red-500" />
        <StatTile label="Tổng Chi Tiền Cast" value={fmtVnd(summary.totalCast)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm KOC trong chiến dịch…"
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Select
          style={{ width: 190 }}
          value={stageFilter}
          onChange={setStageFilter}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "confirmed", label: "Đã xác nhận" },
            { value: "dealing", label: "Đang duyệt / deal" },
            { value: "waiting", label: "Chờ phản hồi" },
            { value: "declined", label: "Từ chối" },
          ]}
        />
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          className="ml-auto"
          onClick={() => setPoolOpen(true)}
        >
          Mời KOC từ kho Data
        </Button>
      </div>

      <Table<CampaignKocDto>
        className="mt-3"
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        size="middle"
        pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} KOC` }}
        scroll={{ x: "max-content", y: 420 }}
      />

      <InviteFromPoolModal
        open={poolOpen}
        onClose={() => setPoolOpen(false)}
        campaignId={campaignId}
      />
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: Bộ lọc & Mời KOC từ kho Data (available KOCs + invite mutation)
// ════════════════════════════════════════════════════════════════════════════
function InviteFromPoolModal({
  open,
  onClose,
  campaignId,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
}) {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<string | undefined>();
  const [withCast, setWithCast] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading, isFetching } = useAvailableKocsQuery(
    campaignId,
    { keyword: search || undefined, tier, page: 0, size: 100 },
    { enabled: open },
  );
  const inviteMutation = useInviteKocsMutation(campaignId);

  const rows = data ?? [];

  const reset = () => {
    setSelected([]);
    setSearch("");
    setTier(undefined);
    setWithCast(false);
  };

  const handleInvite = async () => {
    if (selected.length === 0) return;
    await inviteMutation.mutateAsync({ kocUserIds: selected, hasCast: withCast });
    message.success(`Đã mời ${selected.length} KOC vào chiến dịch`);
    reset();
    onClose();
  };

  const columns: TableColumnsType<(typeof rows)[number]> = [
    { title: "KOC", dataIndex: "name", key: "name" },
    { title: "Tier", dataIndex: "tier", key: "tier", width: 110, render: (v: string) => v || "—" },
    {
      title: "Followers",
      dataIndex: "followers",
      key: "followers",
      width: 130,
      render: (v: number) => (v ? new Intl.NumberFormat("vi-VN").format(v) : "—"),
    },
    {
      title: "GMV",
      dataIndex: "gmv",
      key: "gmv",
      width: 150,
      render: (v: number) => fmtVnd(v),
    },
    {
      title: "Địa chỉ",
      dataIndex: "topLocation",
      key: "topLocation",
      width: 180,
      render: (v: string, r) => v || r.address || "—",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      title="Bộ lọc & Mời KOC tham gia chiến dịch"
      footer={[
        <span key="count" className="mr-auto text-sm text-gray-500">
          Tìm thấy {rows.length} KOC phù hợp
        </span>,
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="invite"
          type="primary"
          disabled={selected.length === 0}
          loading={inviteMutation.isPending}
          onClick={handleInvite}
        >
          Mời {selected.length} KOC đã chọn
        </Button>,
      ]}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm theo tên KOC…"
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Select
          allowClear
          placeholder="Tier"
          style={{ width: 150 }}
          value={tier}
          onChange={setTier}
          options={["Nano", "Micro", "Macro", "Mega"].map((t) => ({ value: t, label: t }))}
        />
        <Checkbox checked={withCast} onChange={(e) => setWithCast(e.target.checked)}>
          Bật Cast cho các KOC được mời
        </Checkbox>
      </div>

      <Table
        className="mt-3"
        columns={columns}
        dataSource={rows}
        rowKey="id"
        size="middle"
        loading={isLoading || isFetching}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys) => setSelected(keys as string[]),
        }}
        pagination={{ pageSize: 8, showTotal: (t) => `Tổng ${t} KOC` }}
        scroll={{ x: "max-content" }}
      />
    </Modal>
  );
}

