import { DatePicker, Form, Input, Modal, Select } from "antd";
import type { Campaign, CampaignFormValues } from "./types";
import { CATEGORY_OPTIONS } from "./campaign.utils";

interface CampaignFormModalProps {
  open: boolean;
  editingCampaign: Campaign | null;
  onClose: () => void;
  onSubmit: (values: CampaignFormValues) => void;
}

export function CampaignFormModal({
  open,
  editingCampaign,
  onClose,
  onSubmit,
}: CampaignFormModalProps) {
  const [form] = Form.useForm<CampaignFormValues>();
  const isEditing = editingCampaign !== null;

  const handleAfterOpen = (isOpen: boolean) => {
    if (isOpen && editingCampaign) {
      form.setFieldsValue({
        name: editingCampaign.name,
        description: editingCampaign.description,
        brandName: editingCampaign.brandName,
        category: editingCampaign.category,
        status: editingCampaign.status,
        dateRange: [
          editingCampaign.startDate,
          editingCampaign.endDate,
        ] as any,
      });
    }
    if (!isOpen) {
      form.resetFields();
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEditing ? "Lưu thay đổi" : "Tạo chiến dịch"}
      cancelText="Hủy"
      afterOpenChange={handleAfterOpen}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Tên chiến dịch"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên chiến dịch" }]}
        >
          <Input placeholder="Ví dụ: Summer Sale 2026..." />
        </Form.Item>

        <Form.Item label="Mô tả chiến dịch" name="description">
          <Input.TextArea rows={3} placeholder="Mô tả mục tiêu, đối tượng..." />
        </Form.Item>

        <Form.Item label="Tên nhãn hàng" name="brandName">
          <Input placeholder="Ví dụ: Cocoon Vietnam, Samsung..." />
        </Form.Item>

        <Form.Item label="Chủ đề / Ngành hàng" name="category">
          <Select placeholder="Chọn ngành hàng" options={CATEGORY_OPTIONS} allowClear />
        </Form.Item>

        <Form.Item
          label="Thời gian diễn ra"
          name="dateRange"
          rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
        >
          <DatePicker.RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Trạng thái" name="status" initialValue="Draft" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="Draft">Bản nháp (Draft)</Select.Option>
            <Select.Option value="Active">Đang chạy (Active)</Select.Option>
            <Select.Option value="Completed">Hoàn thành (Completed)</Select.Option>
            <Select.Option value="Cancelled">Đã hủy (Cancelled)</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
