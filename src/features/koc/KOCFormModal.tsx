import { Flex, Form, Input, InputNumber, Modal, Select } from "antd";
import type { KOCFormValues, KOCRecord } from "./types";

interface KOCFormModalProps {
  open: boolean;
  editingKOC: KOCRecord | null;
  onClose: () => void;
  onSubmit: (values: KOCFormValues) => void;
}

export function KOCFormModal({ open, editingKOC, onClose, onSubmit }: KOCFormModalProps) {
  const [form] = Form.useForm<KOCFormValues>();
  const isEditing = editingKOC !== null;

  const handleAfterOpen = (isOpen: boolean) => {
    if (isOpen && editingKOC) form.setFieldsValue(editingKOC);
    if (!isOpen) form.resetFields();
  };

  const handleOk = () =>
    form
      .validateFields()
      .then((values) => { onSubmit(values); form.resetFields(); })
      .catch(() => {});

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa KOC" : "Thêm KOC mới"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEditing ? "Lưu thay đổi" : "Thêm mới"}
      cancelText="Hủy"
      afterOpenChange={handleAfterOpen}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
          <Input placeholder="Nhập họ và tên KOC" />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item
            label="Email"
            name="email"
            style={{ flex: 1 }}
            rules={[{ required: true }, { type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="example@gmail.com" disabled={isEditing} />
          </Form.Item>
          <Form.Item label="Số điện thoại / Zalo" name="phone" style={{ flex: 1 }}>
            <Input placeholder="0901234567" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Nền tảng" name="platform" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select placeholder="Chọn nền tảng">
              <Select.Option value="Instagram">Instagram</Select.Option>
              <Select.Option value="TikTok">TikTok</Select.Option>
              <Select.Option value="YouTube">YouTube</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Tier" name="tier" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select placeholder="Chọn tier">
              <Select.Option value="Nano">Nano (&lt; 10K)</Select.Option>
              <Select.Option value="Micro">Micro (10K–100K)</Select.Option>
              <Select.Option value="Macro">Macro (100K–1M)</Select.Option>
              <Select.Option value="Mega">Mega (&gt; 1M)</Select.Option>
            </Select>
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Followers" name="followers" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
          <Form.Item label="Tỷ lệ tương tác (%)" name="engagementRate" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber min={0} max={100} step={0.1} style={{ width: "100%" }} addonAfter="%" />
          </Form.Item>
        </Flex>

        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
          <Select placeholder="Chọn trạng thái">
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Pending">Pending</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
