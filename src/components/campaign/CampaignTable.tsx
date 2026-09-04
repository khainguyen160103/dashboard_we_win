import { Button, Card, Popconfirm, Progress, Space, Table, Tag, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, FlagOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Campaign } from "./types";
import {
  getCampaignMetrics,
  getCampaignRowStatus,
  formatVndShort,
  formatDateVN,
} from "./campaign.metrics.ts";

interface CampaignTableProps {
  campaigns: Campaign[];
  onViewDetail: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: number | string) => void;
}

export function CampaignTable({
  campaigns,
  onViewDetail,
  onEdit,
  onDelete,
}: CampaignTableProps) {
  const columns: TableColumnsType<Campaign> = [
    {
      title: "Tên",
      key: "name",
      width: 240,
      fixed: "left",
      render: (_, record) => {
        const m = getCampaignMetrics(record);
        return (
          <div className="flex items-center gap-2">
            <span
              className="cursor-pointer font-semibold text-[#1890ff]"
              onClick={() => onViewDetail(record)}
            >
              {record.name}
            </span>
            {m.atRisk && (
              <Tag color="error" icon={<FlagOutlined />} className="!m-0">
                Cần chú ý
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Nhãn hàng",
      dataIndex: "brandName",
      key: "brandName",
      width: 150,
      render: (v: string) => v || "—",
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => {
        const status = getCampaignRowStatus(record, getCampaignMetrics(record));
        return (
          <span
            className="inline-flex items-center gap-1.5 font-medium"
            style={{ color: status.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: status.color }}
            />
            {status.label}
          </span>
        );
      },
    },
    {
      title: "% Tiến độ",
      key: "progress",
      width: 170,
      render: (_, record) => {
        const { progress } = getCampaignMetrics(record);
        return (
          <div className="flex items-center gap-2">
            <Progress
              percent={progress}
              showInfo={false}
              size="small"
              strokeColor="#2f6bff"
              className="!m-0 w-24"
            />
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
        );
      },
    },
    {
      title: "Ngân sách",
      key: "budget",
      width: 160,
      render: (_, record) => {
        const { budgetUsed, budgetTotal } = getCampaignMetrics(record);
        return (
          <span className="text-sm">
            {formatVndShort(budgetUsed)}{" "}
            <span className="text-gray-400">/ {formatVndShort(budgetTotal)}</span>
          </span>
        );
      },
    },
    {
      title: "GMV",
      key: "gmv",
      width: 100,
      render: (_, record) => (
        <span className="text-sm font-medium">
          {formatVndShort(getCampaignMetrics(record).gmv)}
        </span>
      ),
    },
    {
      title: "Thời gian",
      key: "dates",
      width: 200,
      render: (_, record) => (
        <span className="text-xs text-gray-600">
          {formatDateVN(record.startDate)} – {formatDateVN(record.endDate)}
        </span>
      ),
    },
    {
      title: "KOC tham gia",
      key: "kocCount",
      width: 120,
      align: "center",
      render: (_, record) => {
        const { confirmedKocs, targetKocs } = getCampaignMetrics(record);
        return (
          <Tooltip title={`${confirmedKocs} KOC xác nhận / mục tiêu ${targetKocs}`}>
            <span className="text-sm">
              {confirmedKocs}/{targetKocs}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Popconfirm
            title="Xóa chiến dịch?"
            description={`Bạn có chắc muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => onDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      size="small"
      className="rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-4"
    >
      <div className="mb-3">
        <div className="text-base font-semibold text-gray-800">Tất cả chiến dịch</div>
        <div className="text-xs text-gray-400">
          Tiến độ = % thời gian đã trôi qua · Cờ "Cần chú ý" tính tự động theo công thức
          at_risk_flag trong Dev Guide
        </div>
      </div>

      <Table<Campaign>
        columns={columns}
        dataSource={campaigns}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t) => `Tổng ${t} chiến dịch`,
        }}
        size="middle"
      />
    </Card>
  );
}
