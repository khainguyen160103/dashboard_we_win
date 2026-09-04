import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { CampaignKocDto, CampaignKocStatus } from "../../model/CampaignKoc";
import {
  CAMPAIGN_KOC_STATUS_COLOR,
  CAMPAIGN_KOC_STATUS_LABEL,
} from "../../model/CampaignKoc";
import {
  useCampaignKocsQuery,
  useInviteKocsMutation,
} from "../../hooks/query/useCampaignKocQuery";
import { getCampaignKocStats } from "./campaignKoc.metrics";
import { formatVND } from "./campaign.utils";
import { getPlatformIcon, getTierColor, formatFollowers } from "../koc/koc.utils";
import { InviteKOCModal } from "./InviteKOCModal";
import { KocInfoModal } from "./KocInfoModal";

interface CampaignInviteListModalProps {
  open: boolean;
  campaignId: string;
  campaignName?: string;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  ...(Object.keys(CAMPAIGN_KOC_STATUS_LABEL) as CampaignKocStatus[]).map((s) => ({
    value: s,
    label: CAMPAIGN_KOC_STATUS_LABEL[s],
  })),
];

export function CampaignInviteListModal({
  open,
  campaignId,
  campaignName,
  onClose,
}: CampaignInviteListModalProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignKocStatus | "ALL">("ALL");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [infoKoc, setInfoKoc] = useState<{ id: string; name?: string } | null>(null);

  const { data: rows = [], isLoading } = useCampaignKocsQuery(campaignId, { enabled: open });
  const inviteMut = useInviteKocsMutation(campaignId);

  const stats = useMemo(() => getCampaignKocStats(rows), [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (
          search &&
          !(r.kocName ?? "").toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [rows, search, statusFilter],
  );

  const handleInvite = async (
    items: { koc: { kocUserId: string }; hasCast: boolean }[],
  ) => {
    if (!items.length) return;
    const withCast = items.filter((i) => i.hasCast).map((i) => i.koc.kocUserId);
    const withoutCast = items.filter((i) => !i.hasCast).map((i) => i.koc.kocUserId);
    try {
      if (withCast.length)
        await inviteMut.mutateAsync({ kocUserIds: withCast, hasCast: true });
      if (withoutCast.length)
        await inviteMut.mutateAsync({ kocUserIds: withoutCast, hasCast: false });
      message.success(`Đã mời ${items.length} KOC vào chiến dịch!`);
    } catch {
      message.error("Mời KOC thất bại, vui lòng thử lại.");
    }
  };

  const columns: TableColumnsType<CampaignKocDto> = [
    {
      title: "KOC",
      key: "koc",
      render: (_, r) => (
        <Flex align="center" gap={10}>
          <Avatar icon={<UserOutlined />} size={32} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.kocName || "—"}</div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>
              {r.kocIdTiktok || r.kocLinkTiktok || r.kocZalo || ""}
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: "Nền tảng / Tier",
      key: "tier",
      width: 150,
      render: (_, r) => (
        <Space size={6}>
          {getPlatformIcon("TikTok")}
          <Tag color={getTierColor(r.kocTier ?? "")} style={{ margin: 0 }}>
            {r.kocTier || "—"}
            {r.kocFollowers != null ? ` (${formatFollowers(r.kocFollowers)})` : ""}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Có Cast?",
      key: "hasCast",
      width: 90,
      align: "center",
      render: (_, r) =>
        r.hasCast ? <Tag color="orange">Có Cast</Tag> : <Tag>0 Cast</Tag>,
    },
    {
      title: "Cast mong muốn / Chốt",
      key: "cast",
      width: 180,
      render: (_, r) => {
        if (!r.hasCast) return <span style={{ color: "#bfbfbf" }}>—</span>;
        return (
          <div style={{ fontSize: 12 }}>
            <div>
              <span style={{ color: "#8c8c8c" }}>Đề xuất: </span>
              {r.desiredCast ? formatVND(r.desiredCast) : "Chưa có"}
            </div>
            <div>
              <span style={{ color: "#8c8c8c" }}>Chốt: </span>
              {r.finalCast ? (
                <strong style={{ color: "#52c41a" }}>{formatVND(r.finalCast)}</strong>
              ) : (
                "Chưa chốt"
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái pipeline",
      key: "status",
      width: 170,
      render: (_, r) => (
        <div>
          <Tag color={CAMPAIGN_KOC_STATUS_COLOR[r.status]}>
            {CAMPAIGN_KOC_STATUS_LABEL[r.status]}
          </Tag>
          {r.rejectReason && (
            <div style={{ fontSize: 11, color: "#ff4d4f", marginTop: 2 }}>
              {r.rejectReason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 110,
      render: (_, r) => (
        <a onClick={() => setInfoKoc({ id: r.kocUserId, name: r.kocName })}>
          Chi tiết →
        </a>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Danh sách mời KOC</div>
          <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 400 }}>
            {campaignName ? `${campaignName} · ` : ""}
            {stats.total} KOC được mời
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Đóng</Button>}
      width={1180}
      destroyOnClose
    >
      {/* Stat cards */}
      <Flex gap={12} style={{ marginBottom: 16 }} wrap="wrap">
        <Card size="small" style={{ flex: 1, minWidth: 150, textAlign: "center" }}>
          <Statistic title="KOC Đã Mời" value={stats.total} prefix={<UsergroupAddOutlined />} />
        </Card>
        <Card size="small" style={{ flex: 1, minWidth: 150, textAlign: "center" }}>
          <Statistic
            title="Đã Xác Nhận"
            value={stats.confirmed}
            valueStyle={{ color: "#52c41a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1, minWidth: 150, textAlign: "center" }}>
          <Statistic
            title="Đang Duyệt / Deal"
            value={stats.inProgress}
            valueStyle={{ color: "#fa8c16" }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1, minWidth: 150, textAlign: "center" }}>
          <Statistic
            title="Bị Từ Chối"
            value={stats.rejected}
            valueStyle={{ color: "#ff4d4f" }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1.3, minWidth: 180, textAlign: "center" }}>
          <Statistic
            title="Tổng Chi Tiền Cast"
            value={formatVND(stats.totalCast)}
            valueStyle={{ color: "#1890ff", fontSize: 18 }}
            prefix={<DollarOutlined />}
          />
        </Card>
      </Flex>

      {/* Toolbar */}
      <Flex justify="space-between" align="center" gap={10} style={{ marginBottom: 12 }} wrap="wrap">
        <Space>
          <Input.Search
            placeholder="Tìm KOC trong chiến dịch..."
            style={{ width: 320 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 170 }}
            options={STATUS_OPTIONS}
          />
        </Space>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setPickerOpen(true)}
        >
          + Mời KOC từ kho Data
        </Button>
      </Flex>

      <Table<CampaignKocDto>
        columns={columns}
        dataSource={filtered}
        loading={isLoading}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        bordered
      />

      <InviteKOCModal
        open={pickerOpen}
        campaignId={campaignId}
        alreadyInvitedKocIds={[]}
        onClose={() => setPickerOpen(false)}
        onInvite={handleInvite}
      />

      <KocInfoModal
        open={Boolean(infoKoc)}
        kocUserId={infoKoc?.id}
        fallbackName={infoKoc?.name}
        onClose={() => setInfoKoc(null)}
      />
    </Modal>
  );
}

export default CampaignInviteListModal;
