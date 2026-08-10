import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Input,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { JobRecord, JobStatus } from "./types";
import { getJobStatusColor, getJobStatusLabel, getQualityColor, getQualityLabel } from "./job.utils";
import { getPlatformIcon, getTierColor, formatFollowers } from "../koc/koc.utils";

interface JobPMViewProps {
  jobs: JobRecord[];
  onOpenReviewModal: (job: JobRecord) => void;
  onOpenKocModal: (job: JobRecord) => void;
}

export function JobPMView({ jobs, onOpenReviewModal, onOpenKocModal }: JobPMViewProps) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== "All" && job.status !== statusFilter) return false;
    if (
      searchText &&
      !job.title.toLowerCase().includes(searchText.toLowerCase()) &&
      !job.kocName.toLowerCase().includes(searchText.toLowerCase()) &&
      !job.campaignName.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const pendingCount = jobs.filter((j) => j.status === "Pending").length;
  const approvedCount = jobs.filter((j) => j.status === "Approved").length;
  const rejectedCount = jobs.filter((j) => j.status === "Rejected").length;

  const columns: TableColumnsType<JobRecord> = [
    {
      title: "Tên Video / Nội dung",
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
              🎬 Xem Link Video
            </a>
          ) : (
            <span style={{ fontSize: 11, color: "#bfbfbf" }}>Chưa có link video</span>
          )}
        </div>
      ),
    },
    {
      title: "Chiến Dịch",
      key: "campaign",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{record.campaignName}</div>
          {record.brandName && (
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>{record.brandName}</div>
          )}
        </div>
      ),
    },
    {
      title: "Thông Tin KOC",
      key: "kocInfo",
      render: (_, record) => (
        <Flex align="center" gap={8}>
          <Avatar icon={<UserOutlined />} size={32} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {record.kocName}{" "}
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                style={{ padding: 0, fontSize: 12 }}
                onClick={() => onOpenKocModal(record)}
              >
                Chi tiết
              </Button>
            </div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>
              <Space size={4}>
                {getPlatformIcon(record.kocPlatform)}
                <Tag color={getTierColor(record.kocTier)} style={{ margin: 0, fontSize: 10 }}>
                  {record.kocTier}
                </Tag>
                <span>({formatFollowers(record.kocFollowers)})</span>
              </Space>
            </div>
          </div>
        </Flex>
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
      title: "Chất Lượng",
      key: "quality",
      width: 140,
      render: (_, record) =>
        record.quality ? (
          <Tag color={getQualityColor(record.quality)}>
            {getQualityLabel(record.quality)}
          </Tag>
        ) : (
          <span style={{ fontSize: 12, color: "#bfbfbf" }}>—</span>
        ),
    },
    {
      title: "Ngày Nộp",
      dataIndex: "submittedDate",
      key: "submittedDate",
      width: 110,
      render: (d?: string) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—"),
    },
    {
      title: "Hành Động PM",
      key: "action",
      width: 130,
      render: (_, record) => (
        <Button
          type={record.status === "Pending" ? "primary" : "default"}
          size="small"
          onClick={() => onOpenReviewModal(record)}
        >
          {record.status === "Pending" ? "Duyệt Video ✓" : "Sửa Đánh Giá"}
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Metric summary */}
      <Flex gap={16} style={{ marginBottom: 20 }}>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Chưa Duyệt (Pending)"
            value={pendingCount}
            valueStyle={{ color: "#fa8c16" }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Đã Phê Duyệt"
            value={approvedCount}
            valueStyle={{ color: "#52c41a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Bị Từ Chối / Yêu Cầu Sửa"
            value={rejectedCount}
            valueStyle={{ color: "#ff4d4f" }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Tổng Số Video Submissions"
            value={jobs.length}
            prefix={<VideoCameraOutlined />}
          />
        </Card>
      </Flex>

      {/* Search & Filters */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên Video, KOC, Chiến dịch..."
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ width: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
          options={[
            { value: "All", label: "Tất cả Trạng thái" },
            { value: "Pending", label: "Chưa duyệt (Pending)" },
            { value: "Approved", label: "Đã phê duyệt (Approved)" },
            { value: "Rejected", label: "Yêu cầu sửa (Rejected)" },
            { value: "NotSubmitted", label: "Chưa nộp video" },
          ]}
        />
      </Flex>

      {/* Main Table */}
      <Table<JobRecord>
        columns={columns}
        dataSource={filteredJobs}
        rowKey="id"
        bordered
        size="middle"
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </>
  );
}
