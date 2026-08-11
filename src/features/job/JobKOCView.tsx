import {
  Avatar,
  Button,
  Card,
  Flex,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { JobRecord } from "./types";
import { getJobStatusColor, getJobStatusLabel, getQualityColor, getQualityLabel } from "./job.utils";
import { initialMockKOCs } from "../koc/koc.data";

interface JobKOCViewProps {
  jobs: JobRecord[];
  activeKocId: number;
  onChangeActiveKoc: (kocId: number) => void;
  onOpenUploadModal: (job: JobRecord) => void;
}

export function JobKOCView({
  jobs,
  activeKocId,
  onChangeActiveKoc,
  onOpenUploadModal,
}: JobKOCViewProps) {
  // Filter jobs for the selected KOC
  const kocJobs = jobs.filter((j) => j.kocId === activeKocId);
  const currentKoc = initialMockKOCs.find((k) => k.id === activeKocId);

  const pendingCount = kocJobs.filter((j) => j.status === "Pending").length;
  const approvedCount = kocJobs.filter((j) => j.status === "Approved").length;
  const rejectedCount = kocJobs.filter((j) => j.status === "Rejected").length;

  const columns: TableColumnsType<JobRecord> = [
    {
      title: "Chiến Dịch Tham Gia",
      key: "campaign",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1890ff" }}>
            {record.campaignName}
          </div>
          {record.brandName && (
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>
              Nhãn hàng: {record.brandName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tên Job / Nội dung Video",
      key: "title",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{record.title}</div>
          {record.videoUrl ? (
            <a
              href={record.videoUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: "#1890ff" }}
            >
              🎬 Xem Video đã nộp
            </a>
          ) : (
            <span style={{ fontSize: 11, color: "#ff4d4f" }}>⚠️ Chưa nộp video</span>
          )}
        </div>
      ),
    },
    {
      title: "Trạng Thái Duyệt",
      key: "status",
      width: 140,
      render: (_, record) => (
        <Tag color={getJobStatusColor(record.status)}>
          {getJobStatusLabel(record.status)}
        </Tag>
      ),
    },
    {
      title: "Đánh Giá & Feedback PM",
      key: "feedback",
      render: (_, record) => (
        <div>
          {record.quality && (
            <div style={{ marginBottom: 2 }}>
              <Tag color={getQualityColor(record.quality)}>
                {getQualityLabel(record.quality)}
              </Tag>
            </div>
          )}
          {record.pmFeedback ? (
            <div
              style={{
                fontSize: 12,
                color: record.status === "Rejected" ? "#ff4d4f" : "#595959",
                background: record.status === "Rejected" ? "#fff2f0" : "#f5f5f5",
                padding: "4px 8px",
                borderRadius: 4,
                marginTop: 2,
              }}
            >
              <strong>PM:</strong> {record.pmFeedback}
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "#bfbfbf" }}>Chưa có nhận xét</span>
          )}
        </div>
      ),
    },
    {
      title: "Hạn Nộp",
      dataIndex: "deadline",
      key: "deadline",
      width: 110,
      render: (d?: string) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—"),
    },
    {
      title: "Thao Tác KOC",
      key: "action",
      width: 140,
      render: (_, record) => {
        if (record.status === "Approved") {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Đã hoàn thành
            </Tag>
          );
        }
        return (
          <Button
            type="primary"
            size="small"
            icon={<UploadOutlined />}
            style={
              record.status === "Rejected"
                ? { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }
                : {}
            }
            onClick={() => onOpenUploadModal(record)}
          >
            {record.status === "Rejected"
              ? "Nộp lại Video ↺"
              : record.status === "Pending"
                ? "Cập nhật Video"
                : "Nộp Video ⬆"}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Flex gap={16} style={{ marginBottom: 20 }}>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Job Đang Tham Gia"
            value={kocJobs.length}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Đang Chờ PM Duyệt"
            value={pendingCount}
            valueStyle={{ color: "#fa8c16" }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Video Đã Phê Duyệt"
            value={approvedCount}
            valueStyle={{ color: "#52c41a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Cần Sửa Lại / Từ Chối"
            value={rejectedCount}
            valueStyle={{ color: "#ff4d4f" }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </Flex>

      {/* Job list table for KOC */}
      <Table<JobRecord>
        columns={columns}
        dataSource={kocJobs}
        rowKey="id"
        bordered
        size="middle"
        pagination={false}
        locale={{ emptyText: "Bạn chưa đăng ký tham gia chiến dịch nào hoặc chưa có job nào được phân công." }}
      />
    </>
  );
}
