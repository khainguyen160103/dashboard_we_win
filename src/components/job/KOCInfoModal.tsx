import { Avatar, Descriptions, Modal, Space, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { JobRecord } from "./types";
import { getPlatformIcon, getTierColor, formatFollowers } from "../koc/koc.utils";

interface KOCInfoModalProps {
  open: boolean;
  job: JobRecord | null;
  onClose: () => void;
}

export function KOCInfoModal({ open, job, onClose }: KOCInfoModalProps) {
  if (!job) return null;

  return (
    <Modal
      title={
        <Space align="center">
          <Avatar icon={<UserOutlined />} size="large" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{job.kocName}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>{job.kocEmail}</div>
          </div>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Descriptions size="small" column={2} bordered style={{ marginTop: 16 }}>
        <Descriptions.Item label="Họ và tên" span={2}>
          <strong>{job.kocName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Email">{job.kocEmail}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại / Zalo">
          {job.kocPhone || "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label="Nền tảng chính">
          <Space>
            {getPlatformIcon(job.kocPlatform)}
            <span>{job.kocPlatform}</span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Phân hạng Tier">
          <Tag color={getTierColor(job.kocTier)}>{job.kocTier}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng Follower">
          <strong>{formatFollowers(job.kocFollowers)}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Tỷ lệ tương tác (ER)">
          <Tag color={job.kocEngagementRate && job.kocEngagementRate >= 8 ? "green" : "blue"}>
            {job.kocEngagementRate ? `${job.kocEngagementRate}%` : "N/A"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Chiến dịch hiện tại" span={2}>
          <Tag color="purple">{job.campaignName}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
