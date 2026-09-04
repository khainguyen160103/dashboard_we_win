import { useMemo } from "react";
import {
  Avatar,
  Card,
  Descriptions,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import {
  FolderOpenOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { KOCRecord } from "./types";
import { getPlatformIcon, getTierColor, formatFollowers } from "./koc.utils";
import { initialMockCampaigns } from "../campaign/campaign.data";
import { initialMockJobs } from "../job/job.data";
import { getPipelineStatusColor, formatVND } from "../campaign/campaign.utils";
import { PIPELINE_LABELS } from "../campaign/types";
import { getJobStatusColor, getJobStatusLabel, getQualityColor, getQualityLabel } from "../job/job.utils";
import type { CampaignKOC } from "../campaign/types";
import type { JobRecord } from "../job/types";

interface KOCHistoryModalProps {
  open: boolean;
  koc: KOCRecord | null;
  onClose: () => void;
}

export function KOCHistoryModal({ open, koc, onClose }: KOCHistoryModalProps) {
  if (!koc) return null;

  // 1. Find all campaigns this KOC has participated in
  const participatingCampaigns = useMemo(() => {
    const list: { campaignName: string; brandName?: string; kocData: CampaignKOC }[] = [];
    initialMockCampaigns.forEach((camp) => {
      const foundKoc = camp.kocs.find((k) => k.kocId === koc.id);
      if (foundKoc) {
        list.push({
          campaignName: camp.name,
          brandName: camp.brandName,
          kocData: foundKoc,
        });
      }
    });
    return list;
  }, [koc]);

  // 2. Find all jobs assigned to this KOC
  const assignedJobs = useMemo(() => {
    return initialMockJobs.filter((j) => j.kocId === koc.id);
  }, [koc]);

  // Campaign table columns
  const campaignColumns: TableColumnsType<{ campaignName: string; brandName?: string; kocData: CampaignKOC }> = [
    {
      title: "Tên chiến dịch",
      key: "campaignName",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1890ff" }}>{record.campaignName}</div>
          {record.brandName && (
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>Nhãn hàng: {record.brandName}</div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái Pipeline",
      key: "status",
      width: 160,
      render: (_, record) => (
        <Tag color={getPipelineStatusColor(record.kocData.status)}>
          {PIPELINE_LABELS[record.kocData.status]}
        </Tag>
      ),
    },
    {
      title: "Có Cast?",
      key: "hasCast",
      width: 90,
      align: "center",
      render: (_, record) =>
        record.kocData.hasCast ? (
          <Tag color="orange">Có Cast</Tag>
        ) : (
          <Tag color="default">0 Cast</Tag>
        ),
    },
    {
      title: "Thù lao Cast (Đề xuất / Chốt)",
      key: "cast",
      width: 200,
      render: (_, record) => {
        if (!record.kocData.hasCast) return <span style={{ color: "#bfbfbf" }}>—</span>;
        return (
          <div style={{ fontSize: 12 }}>
            <div>
              <span style={{ color: "#8c8c8c" }}>Đề xuất: </span>
              {record.kocData.desiredCast ? formatVND(record.kocData.desiredCast) : "Chưa có"}
            </div>
            <div>
              <span style={{ color: "#8c8c8c" }}>Chốt cuối: </span>
              {record.kocData.finalCast ? (
                <strong style={{ color: "#52c41a" }}>{formatVND(record.kocData.finalCast)}</strong>
              ) : (
                "Đang thỏa thuận"
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Ngày tham gia",
      key: "invitedAt",
      width: 120,
      render: (_, record) =>
        record.kocData.invitedAt
          ? new Date(record.kocData.invitedAt).toLocaleDateString("vi-VN")
          : "—",
    },
  ];

  // Job table columns
  const jobColumns: TableColumnsType<JobRecord> = [
    {
      title: "Tên Job / Video",
      key: "title",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.title}</div>
          {record.videoUrl ? (
            <a href={record.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#1890ff" }}>
              🎬 Link Video bài đăng
            </a>
          ) : (
            <span style={{ fontSize: 11, color: "#bfbfbf" }}>Chưa có link video</span>
          )}
        </div>
      ),
    },
    {
      title: "Chiến dịch",
      dataIndex: "campaignName",
      key: "campaignName",
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => (
        <Tag color={getJobStatusColor(record.status)}>
          {getJobStatusLabel(record.status)}
        </Tag>
      ),
    },
    {
      title: "Đánh giá PM",
      key: "quality",
      width: 140,
      render: (_, record) => (
        <div>
          {record.quality && (
            <Tag color={getQualityColor(record.quality)}>
              {getQualityLabel(record.quality)}
            </Tag>
          )}
          {record.pmFeedback && (
            <div style={{ fontSize: 11, color: "#595959", marginTop: 2 }}>
              {record.pmFeedback}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hạn nộp",
      dataIndex: "deadline",
      key: "deadline",
      width: 110,
      render: (d?: string) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—"),
    },
  ];

  return (
    <Modal
      title={
        <Space align="center">
          <Avatar icon={<UserOutlined />} size={40} style={{ backgroundColor: "#1890ff" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {koc.name} {koc.gender && <Tag style={{ fontSize: 11 }}>{koc.gender}</Tag>}
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>{koc.email} • {koc.phone}</div>
          </div>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      {/* Overview Info Card */}
      <Card size="small" style={{ marginTop: 16, marginBottom: 16, backgroundColor: "#fafafa" }}>
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }}>
          <Descriptions.Item label="Nền tảng">
            <Space size={4}>
              {getPlatformIcon(koc.platform)}
              <span>{koc.platform}</span>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Phân hạng Tier">
            <Tag color={getTierColor(koc.tier)}>{koc.tier}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Followers">
            <strong>{formatFollowers(koc.followers)}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="ER (%)">
            <Tag color="green">{koc.engagementRate}%</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Đặc điểm kênh">
            <Tag color="blue">{koc.category || "N/A"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            📍 {koc.city || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Doanh số GMV" span={2}>
            <strong style={{ color: "#52c41a" }}>
              {koc.gmv ? formatVND(koc.gmv) : "0 ₫"}
            </strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Tabs for Campaigns vs Jobs */}
      <Tabs
        defaultActiveKey="campaigns"
        items={[
          {
            key: "campaigns",
            label: (
              <Space>
                <FolderOpenOutlined />
                <span>Chiến dịch đã tham gia ({participatingCampaigns.length})</span>
              </Space>
            ),
            children: (
              <Table
                columns={campaignColumns}
                dataSource={participatingCampaigns}
                rowKey={(r) => r.campaignName}
                size="small"
                bordered
                pagination={false}
                locale={{ emptyText: "KOC này chưa tham gia chiến dịch nào." }}
              />
            ),
          },
          {
            key: "jobs",
            label: (
              <Space>
                <VideoCameraOutlined />
                <span>Job &amp; Video đã nhận ({assignedJobs.length})</span>
              </Space>
            ),
            children: (
              <Table<JobRecord>
                columns={jobColumns}
                dataSource={assignedJobs}
                rowKey="id"
                size="small"
                bordered
                pagination={false}
                locale={{ emptyText: "KOC này chưa có job/video nào." }}
              />
            ),
          },
        ]}
      />
    </Modal>
  );
}
