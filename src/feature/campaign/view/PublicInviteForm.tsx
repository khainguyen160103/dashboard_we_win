import { useParams, useSearchParams } from "react-router";
import { Alert, Button, Checkbox, Form, Input, InputNumber, Radio, Result, Spin, Typography } from "antd";
import { usePublicInviteFormQuery, useSubmitInviteFormMutation } from "../hook/useInviteFormQuery";
import { FIXED_FIELDS, type InviteFormField } from "../model/InviteForm";
import { fmtVNDate } from "../utils/campaignFlow";

const { Title, Paragraph, Text } = Typography;

const numberProps = {
  className: "!w-full",
  min: 0,
  formatter: (v?: string | number) => `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
  parser: (v?: string) => Number((v ?? "").replace(/\./g, "")),
};

/**
 * Form.Item truyền `value` / `onChange` (và `id`) vào component con trực tiếp —
 * phải chuyển tiếp xuống control bên trong, nếu không form không nhận được giá trị.
 */
function CustomInput({ field, ...control }: { field: InviteFormField; value?: any; onChange?: (v: any) => void; id?: string }) {
  switch (field.type) {
    case "textarea":
      return <Input.TextArea rows={3} {...control} />;
    case "number":
      return <InputNumber {...numberProps} {...control} />;
    case "date":
      return <Input type="date" {...control} />;
    case "select":
      return (
        <Radio.Group className="flex flex-col gap-1.5" {...control}>
          {(field.options ?? []).map((o) => (
            <Radio key={o} value={o}>
              {o}
            </Radio>
          ))}
        </Radio.Group>
      );
    case "multiselect":
      return <Checkbox.Group className="flex flex-col gap-1.5" options={field.options ?? []} {...control} />;
    default:
      return <Input {...control} />;
  }
}

/** Trang public `/{campaignId}/form-invite` — KOC điền form đăng ký tham gia chiến dịch (không cần đăng nhập). */
export default function PublicInviteForm() {
  const { campaignId = "" } = useParams();
  // ?src=facebook / zalo... -> biết đơn đến từ nền tảng nào
  const [searchParams] = useSearchParams();
  const source = searchParams.get("src");
  const formQ = usePublicInviteFormQuery(campaignId);
  const submit = useSubmitInviteFormMutation(campaignId);
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const { customAnswers, ...fixed } = values;
    submit.mutate({ ...fixed, customAnswers: (customAnswers as Record<string, unknown>) ?? {}, source });
  };

  const data = formQ.data;
  const errorMessage = (e: unknown) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (e as Error)?.message;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[680px] rounded-2xl border border-gray-200 bg-white p-5 shadow-md sm:p-8">
        {formQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spin />
          </div>
        ) : formQ.isError || !data ? (
          <Result status="404" title="Form không khả dụng" subTitle={errorMessage(formQ.error) ?? "Link không đúng hoặc form đã đóng."} />
        ) : submit.isSuccess ? (
          <Result
            status="success"
            title="Đăng ký thành công!"
            subTitle={`Cảm ơn bạn đã đăng ký tham gia "${data.campaignName}". Wewin sẽ liên hệ với bạn qua Zalo/email sớm nhất.`}
          />
        ) : (
          <>
            <Title level={3} className="!mb-1">
              {data.title || `Đăng ký tham gia chiến dịch ${data.campaignName}`}
            </Title>
            <Text type="secondary">
              Chiến dịch <b>{data.campaignName}</b>
              {data.campaignStartTime && ` · ${fmtVNDate(data.campaignStartTime)} – ${fmtVNDate(data.campaignEndTime)}`}
            </Text>
            {data.description && <Paragraph className="!mb-0 !mt-3 whitespace-pre-line">{data.description}</Paragraph>}

            {submit.isError && (
              <Alert type="error" showIcon className="!mt-4" title="Gửi form thất bại" description={errorMessage(submit.error)} />
            )}

            <Form form={form} layout="vertical" className="!mt-6" onFinish={handleFinish} requiredMark>
              {FIXED_FIELDS.map((f) => (
                <Form.Item
                  key={f.key}
                  name={f.key}
                  label={f.label}
                  rules={[
                    { required: f.required, message: `Vui lòng nhập ${f.label.toLowerCase()}` },
                    ...(f.type === "email" ? [{ type: "email" as const, message: "Email không hợp lệ" }] : []),
                  ]}
                >
                  {f.type === "number" ? (
                    <InputNumber {...numberProps} />
                  ) : f.type === "textarea" ? (
                    <Input.TextArea rows={2} placeholder={f.placeholder} />
                  ) : (
                    <Input type={f.type === "email" ? "email" : "text"} placeholder={f.placeholder} />
                  )}
                </Form.Item>
              ))}

              {data.customFields.map((f) => (
                <Form.Item
                  key={f.key}
                  name={["customAnswers", f.key]}
                  label={f.label}
                  rules={[{ required: f.required, message: "Vui lòng trả lời câu hỏi này" }]}
                >
                  <CustomInput field={f} />
                </Form.Item>
              ))}

              <Button type="primary" htmlType="submit" size="large" block loading={submit.isPending}>
                Gửi đăng ký
              </Button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
