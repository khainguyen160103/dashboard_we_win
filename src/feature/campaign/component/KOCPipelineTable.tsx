import {
  Avatar,
  Button,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { CampaignKOC, KOCPipelineStatus } from "../model/types";
import { PIPELINE_LABELS } from "../model/types";
import { getPipelineStatusColor, formatVND } from "../utils/campaign.utils";
import { getPlatformIcon, getTierColor } from "../../../components/koc/koc.utils";

interface KOCPipelineTableProps {
  kocs: CampaignKOC[];
  isCampaignCompleted: boolean;
  onUpdateStatus: (kocId: number, nextStatus: KOCPipelineStatus, reason?: string) => void;
  onOpenDealModal: (koc: CampaignKOC) => void;
  onRemoveKOC: (kocId: number) => void;
}

export function KOCPipelineTable({
  kocs,
  isCampaignCompleted,
  onUpdateStatus,
  onOpenDealModal,
  onRemoveKOC,
}: KOCPipelineTableProps) {
  const columns: TableColumnsType<CampaignKOC> = [
    {
      title: "KOC",
      key: "kocName",
      render: (_, record) => (
        <Flex align="center" gap={10}>
          <Avatar icon={<UserOutlined />} size={32} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{record.kocName}</div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>{record.kocEmail}</div>
          </div>
        </Flex>
      ),
    },
    {
      title: "Nền tảng / Tier",
      key: "platform",
      width: 140,
      render: (_, record) => (
        <Space size={6}>
          {getPlatformIcon(record.platform)}
          <Tag color={getTierColor(record.tier)} style={{ margin: 0 }}>
            {record.tier}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Có Cast?",
      key: "hasCast",
      width: 90,
      align: "center",
      render: (_, record) =>
        record.hasCast ? (
          <Tag color="orange">Có Cast</Tag>
        ) : (
          <Tag color="default">0 Cast</Tag>
        ),
    },
    {
      title: "Cast mong muốn / Chốt",
      key: "cast",
      width: 160,
      render: (_, record) => {
        if (!record.hasCast) return <span style={{ color: "#bfbfbf" }}>—</span>;
        return (
          <div style={{ fontSize: 12 }}>
            <div>
              <span style={{ color: "#8c8c8c" }}>Đề xuất: </span>
              {record.desiredCast ? formatVND(record.desiredCast) : "Chưa có"}
            </div>
            <div>
              <span style={{ color: "#8c8c8c" }}>Chốt: </span>
              {record.finalCast ? (
                <strong style={{ color: "#52c41a" }}>{formatVND(record.finalCast)}</strong>
              ) : (
                "Chưa chốt"
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái Pipeline",
      key: "status",
      width: 160,
      render: (_, record) => (
        <div>
          <Tag color={getPipelineStatusColor(record.status)}>
            {PIPELINE_LABELS[record.status]}
          </Tag>
          {record.rejectReason && (
            <div style={{ fontSize: 11, color: "#ff4d4f", marginTop: 2 }}>
              {record.rejectReason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hành động quy trình",
      key: "pipelineAction",
      render: (_, record) => {
        const { status, hasCast, kocId } = record;

        switch (status) {
          case "invited":
            return (
              <Button
                size="small"
                type="primary"
                onClick={() => onUpdateStatus(kocId, "registered")}
              >
                KOC đã đăng ký ✓
              </Button>
            );

          case "registered":
            return (
              <Space size={6}>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => onUpdateStatus(kocId, "wewin_review")}
                >
                  WeWin Sơ duyệt ✓
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => onUpdateStatus(kocId, "rejected", "WeWin sơ duyệt từ chối")}
                >
                  Từ chối
                </Button>
              </Space>
            );

          case "wewin_review":
            return (
              <Space size={6}>
                <Button
                  size="small"
                  type="primary"
                  style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
                  onClick={() => onUpdateStatus(kocId, "brand_review")}
                >
                  Gửi Nhãn hàng duyệt →
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => onUpdateStatus(kocId, "rejected", "Không qua sơ duyệt")}
                >
                  Từ chối
                </Button>
              </Space>
            );

          case "brand_review":
            return (
              <Space size={6}>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => onUpdateStatus(kocId, "approved")}
                >
                  Nhãn hàng duyệt ✓
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => onUpdateStatus(kocId, "rejected", "Nhãn hàng từ chối")}
                >
                  Từ chối
                </Button>
              </Space>
            );

          case "approved":
            return (
              <Space size={6}>
                {hasCast ? (
                  <Button
                    size="small"
                    icon={<DollarOutlined />}
                    style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16", color: "#fff" }}
                    onClick={() => onOpenDealModal(record)}
                  >
                    Deal giá (Zalo)
                  </Button>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={() => {
                      onUpdateStatus(kocId, "confirmed");
                      message.success(`Đã gửi mail chúc mừng cho ${record.kocName}!`);
                    }}
                  >
                    Xác nhận &amp; Gửi Mail
                  </Button>
                )}
                <Button
                  size="small"
                  danger
                  onClick={() => onUpdateStatus(kocId, "rejected", "KOC không tham gia")}
                >
                  Hủy
                </Button>
              </Space>
            );

          case "dealing":
            return (
              <Space size={6}>
                <Button
                  size="small"
                  type="primary"
                  icon={<MailOutlined />}
                  onClick={() => {
                    onUpdateStatus(kocId, "confirmed");
                    message.success(`Đã chốt giá & gửi mail chúc mừng cho ${record.kocName}!`);
                  }}
                >
                  Chốt &amp; Gửi Mail ✓
                </Button>
                <Button
                  size="small"
                  onClick={() => onOpenDealModal(record)}
                >
                  Chỉnh sửa giá
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => onUpdateStatus(kocId, "rejected", "Không thỏa thuận được giá")}
                >
                  Thất bại
                </Button>
              </Space>
            );

          case "confirmed":
            return (
              <Space size={6}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Đã xác nhận tham gia
                </Tag>
                {isCampaignCompleted && (
                  <Button
                    size="small"
                    icon={<MailOutlined />}
                    style={{ backgroundColor: "#d4b106", borderColor: "#d4b106", color: "#fff" }}
                    onClick={() => {
                      onUpdateStatus(kocId, "thanked");
                      message.success(`Đã gửi thư cảm ơn cho KOC ${record.kocName}!`);
                    }}
                  >
                    Gửi thư cảm ơn
                  </Button>
                )}
              </Space>
            );

          case "thanked":
            return (
              <Tag color="gold" icon={<CheckCircleOutlined />}>
                Đã gửi thư cảm ơn
              </Tag>
            );

          case "rejected":
            return (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                Bị từ chối
              </Tag>
            );

          default:
            return null;
        }
      },
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Popconfirm
          title="Xóa KOC khỏi chiến dịch?"
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
          onConfirm={() => onRemoveKOC(record.kocId)}
        >
          <Button type="text" danger icon={<CloseCircleOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table<CampaignKOC>
      columns={columns}
      dataSource={kocs}
      rowKey="kocId"
      pagination={false}
      size="small"
      bordered
    />
  );
}
