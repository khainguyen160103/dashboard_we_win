import { useEffect } from "react";
import { Form, Input, Modal, Upload, Button, Space, message } from "antd";
import { UploadOutlined, LinkOutlined, VideoCameraOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import type { JobRecord, KOCUploadFormValues } from "./types";

interface UploadVideoModalProps {
  open: boolean;
  job: JobRecord | null;
  onClose: () => void;
  onSubmit: (values: KOCUploadFormValues) => void;
}

export function UploadVideoModal({
  open,
  job,
  onClose,
  onSubmit,
}: UploadVideoModalProps) {
  const [form] = Form.useForm<KOCUploadFormValues>();

  useEffect(() => {
    if (open && job) {
      form.setFieldsValue({
        title: job.title || "",
        description: job.description || "",
        videoUrl: job.videoUrl || "",
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

  const isReupload = job.status === "Rejected";

  const dummyUploadProps: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: true,
    beforeUpload: (file) => {
      form.setFieldValue("videoUrl", `https://cdn.wewin.vn/videos/${file.name}`);
      message.success(`Đã đính kèm file: ${file.name}`);
      return false; // Prevent auto HTTP post
    },
  };

  return (
    <Modal
      title={
        <Space>
          <VideoCameraOutlined style={{ color: "#1890ff" }} />
          <span>{isReupload ? "Nộp lại Video Job" : "Nộp Video Job"}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isReupload ? "Cập nhật & Nộp lại cho PM" : "Nộp Video cho PM Duyệt"}
      cancelText="Hủy"
      width={560}
      destroyOnClose
    >
      <div style={{ marginTop: 8, marginBottom: 16, backgroundColor: "#e6f7ff", padding: 12, borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0050b3" }}>
          Chiến dịch: {job.campaignName}
        </div>
        <div style={{ fontSize: 12, color: "#595959", marginTop: 2 }}>
          Thời hạn nộp: {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Không có"}
        </div>
        {job.pmFeedback && (
          <div style={{ marginTop: 8, padding: 8, background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: 4, fontSize: 12 }}>
            <strong style={{ color: "#ff4d4f" }}>Nhận xét từ PM:</strong> {job.pmFeedback}
          </div>
        )}
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Tiêu đề Video / Nội dung bài đăng"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề video" }]}
        >
          <Input placeholder="Ví dụ: Video review dòng serum mụn mới nhất..." />
        </Form.Item>

        <Form.Item label="Mô tả / Caption đính kèm" name="description">
          <Input.TextArea rows={3} placeholder="Ví dụ: Caption hashtag #WeWin #Cocoon #Skincare..." />
        </Form.Item>

        <Form.Item
          label="Link Video (TikTok / YouTube / Instagram / Google Drive)"
          name="videoUrl"
          rules={[{ required: true, message: "Vui lòng nhập link video hoặc upload file" }]}
        >
          <Input
            prefix={<LinkOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="https://www.tiktok.com/@koc/video/12345678"
          />
        </Form.Item>

        <Form.Item label="Hoặc Tải File Video trực tiếp lên">
          <Upload {...dummyUploadProps}>
            <Button icon={<UploadOutlined />}>Tải file MP4/MOV từ máy tính</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
