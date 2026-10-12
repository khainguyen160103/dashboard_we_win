import { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Typography } from "antd";
import type { CampaignKOC } from "./types";

interface DealPriceModalProps {
  open: boolean;
  koc: CampaignKOC | null;
  onClose: () => void;
  onSave: (desiredCast: number | undefined, finalCast: number | undefined, notes?: string) => void;
}

export function DealPriceModal({ open, koc, onClose, onSave }: DealPriceModalProps) {
  const [form] = Form.useForm<{
    desiredCast?: number;
    finalCast?: number;
    notes?: string;
  }>();

  useEffect(() => {
    if (open && koc) {
      form.setFieldsValue({
        desiredCast: koc.desiredCast,
        finalCast: koc.finalCast,
        notes: koc.notes,
      });
    }
  }, [open, koc, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values.desiredCast, values.finalCast, values.notes);
      form.resetFields();
    });
  };

  if (!koc) return null;

  return (
    <Modal
      title={`Deal giá Cast KOC — ${koc.kocName}`}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Lưu thông tin & Chuyển trạng thái"
      cancelText="Hủy"
      width={480}
      destroyOnClose
    >
      <div style={{ marginTop: 12, marginBottom: 16 }}>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Trao đổi thỏa thuận giá thù lao (Cast) qua kênh Zalo / Phone với KOC.
        </Typography.Text>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Mức Cast KOC mong muốn (đề xuất)"
          name="desiredCast"
          tooltip="Mức thù lao do KOC đưa ra trong form đăng ký hoặc trao đổi ban đầu"
        >
          <InputNumber
            min={0}
            step={500_000}
            style={{ width: "100%" }}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            addonAfter="₫"
            placeholder="Ví dụ: 5,000,000"
          />
        </Form.Item>

        <Form.Item
          label="Mức Cast cuối cùng chốt (Thực tế thỏa thuận)"
          name="finalCast"
          tooltip="Mức thù lao sau khi nhân sự WeWin đã đàm phán thành công"
        >
          <InputNumber
            min={0}
            step={500_000}
            style={{ width: "100%" }}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            addonAfter="₫"
            placeholder="Ví dụ: 4,000,000"
          />
        </Form.Item>

        <Form.Item label="Ghi chú đàm phán / Thỏa thuận qua Zalo" name="notes">
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: KOC đồng ý giảm 20% do hỗ trợ đăng thêm 1 story..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
