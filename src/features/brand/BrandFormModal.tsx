import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import type { Brand, BrandFormValues, BrandTier, BrandStatus } from "./types";
import { INDUSTRY_OPTIONS, TIER_OPTIONS, STATUS_OPTIONS } from "./types";
import { STATUS_LABELS } from "./brand.data";

interface BrandFormModalProps {
  open: boolean;
  editingBrand: Brand | null;
  onClose: () => void;
  onSubmit: (values: BrandFormValues) => void;
}

const { TextArea } = Input;

export function BrandFormModal({ open, editingBrand, onClose, onSubmit }: BrandFormModalProps) {
  const [form] = Form.useForm<BrandFormValues>();

  useEffect(() => {
    if (open) {
      if (editingBrand) {
        form.setFieldsValue({
          name: editingBrand.name,
          industry: editingBrand.industry,
          tier: editingBrand.tier,
          status: editingBrand.status,
          contactName: editingBrand.contactName,
          contactEmail: editingBrand.contactEmail,
          contactPhone: editingBrand.contactPhone,
          website: editingBrand.website,
          address: editingBrand.address,
          taxCode: editingBrand.taxCode,
          description: editingBrand.description,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ tier: "New", status: "Pending" });
      }
    }
  }, [open, editingBrand, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      // validation failed, antd handles display
    }
  };

  return (
    <Modal
      title={editingBrand ? `✏️ Chỉnh sửa: ${editingBrand.name}` : "➕ Thêm nhãn hàng mới"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={editingBrand ? "Lưu thay đổi" : "Thêm nhãn hàng"}
      cancelText="Hủy"
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* Row 1: Name */}
        <Form.Item
          name="name"
          label="Tên nhãn hàng"
          rules={[{ required: true, message: "Vui lòng nhập tên nhãn hàng" }]}
        >
          <Input placeholder="VD: Cocoon Vietnam" />
        </Form.Item>

        {/* Row 2: Industry + Tier */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Form.Item
            name="industry"
            label="Ngành hàng"
            rules={[{ required: true, message: "Chọn ngành hàng" }]}
          >
            <Select placeholder="Chọn ngành hàng">
              {INDUSTRY_OPTIONS.map((i) => (
                <Select.Option key={i} value={i}>{i}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tier"
            label="Tier"
            rules={[{ required: true, message: "Chọn tier" }]}
          >
            <Select placeholder="Chọn tier">
              {TIER_OPTIONS.map((t) => (
                <Select.Option key={t} value={t}>
                  ★ {t as BrandTier}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Row 3: Status */}
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            {STATUS_OPTIONS.map((s) => (
              <Select.Option key={s} value={s}>{STATUS_LABELS[s as BrandStatus]}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Row 4: Contact Name */}
        <Form.Item
          name="contactName"
          label="Tên người liên hệ"
          rules={[{ required: true, message: "Nhập tên người liên hệ" }]}
        >
          <Input placeholder="VD: Nguyễn Thị Lan Anh" />
        </Form.Item>

        {/* Row 5: Email + Phone */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Form.Item
            name="contactEmail"
            label="Email liên hệ"
            rules={[
              { required: true, message: "Nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="brand@company.com" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Nhập SĐT" }]}
          >
            <Input placeholder="028 xxxx xxxx" />
          </Form.Item>
        </div>

        {/* Row 6: Website + Tax Code */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Form.Item name="website" label="Website">
            <Input placeholder="https://company.com" />
          </Form.Item>
          <Form.Item name="taxCode" label="Mã số thuế">
            <Input placeholder="0300xxxxxx" />
          </Form.Item>
        </div>

        {/* Row 7: Address */}
        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="Số nhà, đường, quận, thành phố" />
        </Form.Item>

        {/* Row 8: Description */}
        <Form.Item name="description" label="Mô tả nhãn hàng">
          <TextArea rows={3} placeholder="Mô tả ngắn về nhãn hàng, sản phẩm chủ lực..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
