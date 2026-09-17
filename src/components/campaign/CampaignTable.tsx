import { Button, Card, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import type { Campaign } from "./types";
import { formatDate } from "../../utils/formatDate";
import { useNavigate } from "react-router";
interface CampaignTableProps {
  campaigns?: Campaign[];
  onEdit?: (campaign: Campaign) => void;
}
const STATUS_OPTIONS = [
  { key: "DRAFT", label: "Nháp" },
  { key: "ACTIVE", label: "Đang chạy" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
];



export function CampaignTable({ campaigns, onEdit }: CampaignTableProps) {
  const navigate = useNavigate();
  const columns: TableColumnsType<Campaign> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 240,
      fixed: "left",
    },
    {
      title: "Nhãn hàng",
      dataIndex: "brandName",
      key: "brandName",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (_, record: Campaign) => { return STATUS_OPTIONS.find((o) => o.key === record.status)?.label },

    },
    {
      title: "% Tiến độ",
      dataIndex: "progress",
      key: "progress",
      width: 170,
    },
    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",
      width: 160,
    },
    {
      title: "GMV",
      dataIndex: "gmv",
      key: "gmv",
      width: 100,
    },
    {
      title: "Thời gian",
      dataIndex: "startDate",
      key: "dates",
      width: 200,
      render: (_, record: Campaign) => { console.log(record); return `${formatDate(record.startTime)} → ${formatDate(record.endTime)}` },
    },
    {
      title: "KOC tham gia",
      dataIndex: "kocCount",
      key: "kocCount",
      width: 120,
      align: "center",
    },
    {
      title: "Hành động",

      key: "actions",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => navigate(`/campaigns/${record.id}`)}
            type="primary"
          >
            Xem chi tiết
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(record)}>Sửa</Button>
          )}
        </Space>
      ),
    },
  ];

  console.log("CampaignTable campaigns:", campaigns)
  return (
    <Card
      size="small"
      className="rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-4"
    >

      <Table<Campaign>
        columns={columns}
        dataSource={campaigns}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{
          showTotal: (t) => `Tổng ${t} chiến dịch`,
        }}
        size="middle"
      />
    </Card>
  );
}
