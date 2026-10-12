import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Result, Select, Switch, Tag, Typography, message } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";
import {
  CUSTOM_FIELD_TYPE_LABEL,
  FIXED_FIELDS,
  inviteFormUrl,
  type CustomFieldType,
  type InviteForm,
  type InviteFormField,
} from "../model/InviteForm";
import { useSaveInviteFormMutation } from "../hook/useInviteFormQuery";
import { InviteLinkList } from "./InviteLinkList";

type FormValues = {
  title: string;
  description?: string;
  active: boolean;
  customFields: InviteFormField[];
};

const newKey = () => `cf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const hasOptions = (t?: CustomFieldType) => t === "select" || t === "multiselect";

export function InviteFormBuilderModal({
  open,
  onClose,
  campaignId,
  campaignName,
  form: existing,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName: string;
  form?: InviteForm | null;
}) {
  const [formInst] = Form.useForm<FormValues>();
  const save = useSaveInviteFormMutation(campaignId);
  const [savedLink, setSavedLink] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSavedLink(null);
    formInst.setFieldsValue({
      title: existing?.title ?? `Đăng ký tham gia chiến dịch ${campaignName}`,
      description: existing?.description ?? "",
      active: existing?.active ?? true,
      customFields: existing?.customFields ?? [],
    });
  }, [open, existing, campaignName, formInst]);

  const handleSave = async () => {
    const values = await formInst.validateFields();
    const customFields = (values.customFields ?? []).map((f) => ({
      key: f.key || newKey(),
      label: f.label.trim(),
      type: f.type,
      required: Boolean(f.required),
      options: hasOptions(f.type) ? (f.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
    }));
    await save.mutateAsync({ ...values, customFields });
    message.success(existing ? "Đã cập nhật form mời" : "Đã tạo form mời");
    setSavedLink(inviteFormUrl(campaignId));
  };

  if (savedLink) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={720} title="Form mời đã sẵn sàng">
        <Result
          status="success"
          title="Gửi link cho KOC để đăng ký"
          subTitle="Mỗi nền tảng một link riêng — dashboard sẽ biết đơn đăng ký đến từ đâu."
          className="!pb-2"
        >
          <div className="text-left">
            <InviteLinkList campaignId={campaignId} />
          </div>
        </Result>
        <div className="flex justify-end gap-2">
          <Button href={savedLink} target="_blank">
            Mở form
          </Button>
          <Button type="primary" onClick={onClose}>
            Xong
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={760}
      title={existing ? "Sửa form mời" : "Tạo form mời"}
      okText={existing ? "Lưu thay đổi" : "Tạo form & lấy link"}
      cancelText="Hủy"
      confirmLoading={save.isPending}
      onOk={handleSave}
      destroyOnHidden
    >
      <Form form={formInst} layout="vertical" requiredMark="optional">
        <Form.Item name="title" label="Tiêu đề form" rules={[{ required: true, message: "Nhập tiêu đề form" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Mô tả (hiện ở đầu form)">
          <Input.TextArea rows={2} placeholder="Quyền lợi, yêu cầu, hạn đăng ký…" />
        </Form.Item>
        <Form.Item name="active" label="Đang nhận đăng ký" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Typography.Title level={5} className="!mb-2 !mt-2">
          Trường cố định
        </Typography.Title>
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FIXED_FIELDS.map((f) => (
            <div
              key={f.key}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-600"
            >
              <LockOutlined className="text-gray-400" />
              <span className="flex-1">{f.label}</span>
              {f.required && <Tag className="!m-0">Bắt buộc</Tag>}
            </div>
          ))}
        </div>

        <Typography.Title level={5} className="!mb-2">
          Trường tuỳ chỉnh
        </Typography.Title>
        <Form.List name="customFields">
          {(fields, { add, remove, move }) => (
            <div className="flex flex-col gap-3">
              {fields.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-[13px] text-gray-500">
                  Chưa có trường tuỳ chỉnh nào
                </div>
              )}
              {fields.map(({ key, name }, index) => (
                <div key={key} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                  <Form.Item name={[name, "key"]} hidden>
                    <Input />
                  </Form.Item>
                  <div className="flex flex-wrap items-start gap-2">
                    <Form.Item
                      name={[name, "label"]}
                      className="!mb-0 min-w-[220px] flex-1"
                      rules={[{ required: true, whitespace: true, message: "Nhập tên câu hỏi" }]}
                    >
                      <Input placeholder="Câu hỏi, VD: Bạn có con nhỏ không?" />
                    </Form.Item>
                    <Form.Item name={[name, "type"]} className="!mb-0 w-[150px]" initialValue="text">
                      <Select
                        options={Object.entries(CUSTOM_FIELD_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
                      />
                    </Form.Item>
                    <Form.Item name={[name, "required"]} valuePropName="checked" className="!mb-0" initialValue={false}>
                      <Switch checkedChildren="Bắt buộc" unCheckedChildren="Tuỳ chọn" />
                    </Form.Item>
                    <div className="flex">
                      <Button type="text" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => move(index, index - 1)} />
                      <Button
                        type="text"
                        icon={<ArrowDownOutlined />}
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      />
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                    </div>
                  </div>
                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) =>
                      hasOptions(getFieldValue(["customFields", name, "type"])) && (
                        <Form.Item
                          name={[name, "options"]}
                          className="!mb-0 !mt-2"
                          rules={[{ required: true, type: "array", min: 1, message: "Thêm ít nhất 1 lựa chọn" }]}
                        >
                          <Select mode="tags" open={false} placeholder="Gõ lựa chọn rồi nhấn Enter" tokenSeparators={[","]} />
                        </Form.Item>
                      )
                    }
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add({ key: newKey(), label: "", type: "text", required: false })}
              >
                Thêm trường
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
