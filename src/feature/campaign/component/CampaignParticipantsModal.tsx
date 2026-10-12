import { useMemo, useState } from "react";
import { Button, Input, Modal, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import type { CampaignKocDto, CampaignKocStatus } from "../../model/CampaignKoc";
import {
  CAMPAIGN_KOC_STATUS_COLOR,
  CAMPAIGN_KOC_STATUS_LABEL,
} from "../../model/CampaignKoc";
import { useCampaignKocsQuery } from "../../hooks/query/useCampaignKocQuery";
import { formatVndShort } from "./campaignKoc.metrics";
import { getTierColor } from "../koc/koc.utils";

interface CampaignParticipantsModalProps {
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

export function CampaignParticipantsModal({
  open,
  campaignId,
  campaignName,
  onClose,
}: CampaignParticipantsModalProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignKocStatus | "ALL">("ALL");

  const { data: rows = [], isLoading } = useCampaignKocsQuery(campaignId, { enabled: open });

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (search && !(r.kocName ?? "").toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [rows, search, statusFilter],
  );

  const columns: TableColumnsType<CampaignKocDto> = [
    {
      title: "KOC",
      key: "koc",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.kocName || "—"}</div>
          {r.rejectReason && (
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>{r.rejectReason}</div>
          )}
        </div>
      ),
    },
    {
      title: "Tier",
      dataIndex: "kocTier",
      key: "kocTier",
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={getTierColor(v)}>{v}</Tag> : "—",
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 170,
      render: (_, r) => (
        <span
          style={{ color: CAMPAIGN_KOC_STATUS_COLOR[r.status], fontWeight: 500 }}
        >
          ● {CAMPAIGN_KOC_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      title: "Video giao/nộp/duyệt",
      key: "videos",
      width: 170,
      align: "center",
      render: () => <span style={{ color: "#bfbfbf" }}>— / — / —</span>,
    },
    {
      title: "GMV đóng góp",
      key: "gmv",
      width: 140,
      align: "right",
      render: (_, r) => formatVndShort(r.kocGmv),
    },
    {
      title: "Hoa hồng",
      key: "commission",
      width: 120,
      align: "right",
      render: () => <span style={{ color: "#bfbfbf" }}>—</span>,
    },
  ];

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Danh sách KOC tham gia</div>
          <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 400 }}>
            {campaignName ? `${campaignName} · ` : ""}
            {rows.length} KOC tham gia
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Đóng</Button>}
      width={1000}
      destroyOnClose
    >
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Tìm theo tên KOC..."
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

      <Table<CampaignKocDto>
        columns={columns}
        dataSource={filtered}
        loading={isLoading}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <div style={{ marginTop: 8, fontSize: 11, color: "#bfbfbf" }}>
        Video giao/nộp/duyệt và Hoa hồng sẽ hiển thị khi API chiến dịch trả về dữ liệu
        nghiệm thu video.
      </div>
    </Modal>
  );
}

export default CampaignParticipantsModal;
