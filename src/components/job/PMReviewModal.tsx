import { useEffect } from "react";
import { Form, Input, Modal, Radio, Select, Space, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, VideoCameraOutlined } from "@ant-design/icons";
import type { JobRecord, PMReviewFormValues } from "./types";
import { getQualityLabel } from "./job.utils";

interface PMReviewModalProps {
  open: boolean;
  job: JobRecord | null;
  onClose: () => void;
  onSubmit: (values: PMReviewFormValues) => void;
}

export function PMReviewModal({
  open,
  job,
  onClose,
  onSubmit,
}: PMReviewModalProps) {
  const [form] = Form.useForm<PMReviewFormValues>();

  useEffect(() => {
    if (open && job) {
      form.setFieldsValue({
        status: job.status === "Approved" || job.status === "Rejected" ? job.status : "Approved",
        quality: job.quality || "Good",
        pmFeedback: job.pmFeedback || "",
      });
    }
  }, [open, job, form]);

  if (!job) return null;

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={
        <Space>
          <VideoCameraOutlined style={{ color: "#1890ff" }} />
          <span>Duyệt Video Job — {job.title}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Lưu kết quả duyệt"
      cancelText="Hủy"
      width={600}
      destroyOnClose
    >
      <div style={{ marginTop: 12, marginBottom: 16, backgroundColor: "#fafafa", padding: 12, borderRadius: 8 }}>
        <div style={{ fontSize: 13, marginBottom: 4 }}>
          <strong>Chiến dịch:</strong> {job.campaignName} {job.brandName && `(${job.brandName})`}
        </div>
        <div style={{ fontSize: 13, marginBottom: 4 }}>
          <strong>KOC nộp:</strong> {job.kocName} ({job.kocEmail}) — <Tag color="blue">{job.kocPlatform}</Tag>
        </div>
        {job.videoUrl && (
          <div style={{ fontSize: 13, marginTop: 6 }}>
            <strong>Link Video:</strong>{" "}
            <a href={job.videoUrl} target="_blank" rel="noreferrer" style={{ wordBreak: "break-all" }}>
              {job.videoUrl}
            </a>
          </div>
        )}
        {job.videoFileName && (
          <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 2 }}>
            File đính kèm: 📁 {job.videoFileName}
          </div>
        )}
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Quyết định duyệt"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn kết quả duyệt" }]}
        >
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="Approved" style={{ color: "#52c41a" }}>
              <CheckCircleOutlined /> Phê duyệt (Approved)
            </Radio.Button>
            <Radio.Button value="Rejected" style={{ color: "#ff4d4f" }}>
              <CloseCircleOutlined /> Yêu cầu sửa lại / Từ chối (Rejected)
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Đánh giá chất lượng video"
          name="quality"
          rules={[{ required: true, message: "Vui lòng chọn đánh giá chất lượng" }]}
        >
          <Select placeholder="Chọn mức chất lượng">
            <Select.Option value="Excellent">🌟 {getQualityLabel("Excellent")}</Select.Option>
            <Select.Option value="Good">👍 {getQualityLabel("Good")}</Select.Option>
            <Select.Option value="Average">👌 {getQualityLabel("Average")}</Select.Option>
            <Select.Option value="Poor">⚠️ {getQualityLabel("Poor")}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Nhận xét / Feedback cho KOC"
          name="pmFeedback"
          tooltip="Nội dung này sẽ hiển thị trực tiếp ở màn hình của KOC"
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập ghi chú góp ý chi tiết cho KOC (ví dụ: 'Video làm rất hay nhưng đoạn cuối bị mờ logo, cần chỉnh lại màu sắc...')"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
