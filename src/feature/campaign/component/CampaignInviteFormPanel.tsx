import { useMemo } from "react";
import { Alert, Button, Empty, Spin, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { EditOutlined, FormOutlined, LinkOutlined } from "@ant-design/icons";
import { useInviteFormQuery, useInviteFormSubmissionsQuery } from "../hook/useInviteFormQuery";
import { inviteFormUrl, sourceMeta, type FormSubmission } from "../model/InviteForm";
import { InviteLinkList } from "./InviteLinkList";
import { CAMPAIGN_KOC_STATUS_COLOR, CAMPAIGN_KOC_STATUS_LABEL, type CampaignKocStatus } from "../model/CampaignKoc";
import { fmtNum, fmtVND } from "../utils/campaignFlow";

const fmtDateTime = (s?: string) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

const fmtAnswer = (v: unknown) => {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
};

/** Tab "Form mời": link form + danh sách KOC đã gửi form. */
export function CampaignInviteFormPanel({ campaignId, onEdit }: { campaignId: string; onEdit: () => void }) {
  const formQ = useInviteFormQuery(campaignId);
  const subsQ = useInviteFormSubmissionsQuery(campaignId);
  const form = formQ.data;
  const submissions = useMemo(() => subsQ.data ?? [], [subsQ.data]);

  /** Số đơn theo nguồn link (?src=). */
  const sourceCounts = useMemo(
    () =>
      submissions.reduce<Record<string, number>>((acc, s) => {
        const k = s.source || "direct";
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
    [submissions],
  );

  const columns = useMemo<TableColumnsType<FormSubmission>>(
    () => [
      { title: "Thời gian gửi", dataIndex: "submittedAt", width: 170, render: fmtDateTime, fixed: "left" },
      { title: "Họ và tên", key: "fullname", width: 170, fixed: "left", render: (_, r) => <b>{fmtAnswer(r.fixedAnswers.fullname)}</b> },
      {
        title: "Nguồn",
        key: "source",
        width: 120,
        filters: Object.keys(sourceCounts).map((k) => ({ text: sourceMeta(k).label, value: k })),
        onFilter: (value, r) => (r.source || "direct") === value,
        render: (_, r) => {
          const meta = sourceMeta(r.source);
          return <Tag color={meta.color}>{meta.label}</Tag>;
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        width: 140,
        render: (s?: string | null) =>
          s ? (
            <Tag color={CAMPAIGN_KOC_STATUS_COLOR[s as CampaignKocStatus]}>
              {CAMPAIGN_KOC_STATUS_LABEL[s as CampaignKocStatus] ?? s}
            </Tag>
          ) : (
            "—"
          ),
      },
      { title: "SĐT / Zalo", key: "zalo", width: 130, render: (_, r) => fmtAnswer(r.fixedAnswers.zalo) },
      { title: "Email", key: "email", width: 200, render: (_, r) => fmtAnswer(r.fixedAnswers.email) },
      {
        title: "Kênh TikTok",
        key: "tiktok",
        width: 180,
        render: (_, r) =>
          r.fixedAnswers.linkTiktok ? (
            <a href={String(r.fixedAnswers.linkTiktok)} target="_blank" rel="noreferrer">
              {fmtAnswer(r.fixedAnswers.idTiktok ?? r.fixedAnswers.linkTiktok)}
            </a>
          ) : (
            fmtAnswer(r.fixedAnswers.idTiktok)
          ),
      },
      { title: "Followers", key: "follower", width: 110, render: (_, r) => fmtNum(r.fixedAnswers.follower as number | null) },
      { title: "GMV 30 ngày", key: "gmv30", width: 120, render: (_, r) => fmtVND(r.fixedAnswers.gmv30 as number | null) },
      { title: "Địa chỉ nhận hàng mẫu", key: "address", width: 260, render: (_, r) => fmtAnswer(r.fixedAnswers.address) },
      ...(form?.customFields ?? []).map((f) => ({
        title: f.label,
        key: f.key,
        width: 180,
        render: (_: unknown, r: FormSubmission) => fmtAnswer(r.customAnswers?.[f.key]),
      })),
    ],
    [form?.customFields, sourceCounts],
  );

  if (formQ.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }
  if (formQ.isError) {
    return <Alert type="error" showIcon title="Không tải được form mời" description={formQ.error?.message} />;
  }
  if (!form) {
    return (
      <Empty description="Chiến dịch chưa có form mời" className="py-10">
        <Button type="primary" icon={<FormOutlined />} onClick={onEdit}>
          Tạo form mời
        </Button>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <LinkOutlined className="text-gray-500" />
          <Typography.Text strong>Link form theo kênh</Typography.Text>
          <Typography.Text type="secondary" className="text-xs">
            Gửi đúng link cho từng nền tảng để biết KOC đăng ký từ đâu
          </Typography.Text>
          {form.active ? <Tag color="green">Đang nhận đăng ký</Tag> : <Tag>Đã đóng</Tag>}
          <div className="ml-auto flex gap-2">
            <Button href={inviteFormUrl(campaignId)} target="_blank">
              Mở form
            </Button>
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Sửa form
            </Button>
          </div>
        </div>
        <InviteLinkList campaignId={campaignId} counts={sourceCounts} />
      </div>

      {subsQ.isError && <Alert type="error" showIcon title="Không tải được danh sách đăng ký" description={subsQ.error?.message} />}

      <Table<FormSubmission>
        rowKey="id"
        size="middle"
        loading={subsQ.isLoading}
        columns={columns}
        dataSource={submissions}
        locale={{ emptyText: "Chưa có KOC nào gửi form" }}
        pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} KOC đã gửi form` }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}
