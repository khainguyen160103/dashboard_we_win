import { useMemo, useState, type ReactNode } from "react";
import { Button, Card, Empty, Form, Input, Modal, Select, Spin, Table, Tag, Typography, message } from "antd";
import type { TableColumnsType } from "antd";
import { useCampaignKocsQuery } from "../hook/useCampaignKocQuery";
import { useCampaign } from "../hook/useCampaignQuery";
import { useCreateVideoMutation, useUpdateVideoMutation, useVideosQuery } from "../hook/useVideoQuery";
import { videoStatusMeta, type VideoDto, type VideoRequest, type VideoStatus } from "../model/Video";
import { authStore } from "../../../store/authStore";
import {
  CAMPAIGN_KOC_STATUS_LABEL,
  CAMPAIGN_KOC_STATUS_COLOR,
  type CampaignKocDto,
  type CampaignKocStatus,
} from "../model/CampaignKoc";

const { Title, Text } = Typography;

const fmtVnd = (n?: number | null) =>
  n === undefined || n === null || n === 0
    ? "—"
    : `${new Intl.NumberFormat("vi-VN").format(n)} đ`;

const fmtNum = (n?: number | null) =>
  n === undefined || n === null ? "—" : new Intl.NumberFormat("vi-VN").format(n);

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold text-gray-900 ${tone ?? ""}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

const countBy = (rows: CampaignKocDto[], ...statuses: CampaignKocStatus[]) =>
  rows.filter((r) => statuses.includes(r.status)).length;

// ════════════════════════════════════════════════════════════════════════════
// Tầng 4 · Danh sách KOC tham gia
// ════════════════════════════════════════════════════════════════════════════
export function CampaignRosterPanel({ campaignId }: { campaignId: string }) {
  const query = useCampaignKocsQuery(campaignId);
  const { isLoading, isError } = query;
  const { data: campaign } = useCampaign(campaignId);
  const rows = useMemo<CampaignKocDto[]>(() => query.data ?? [], [query.data]);

  const target = Number(campaign?.targetTotalKoc ?? 0);
  const registered = countBy(rows, "REGISTERED", "WEWIN_REVIEW", "BRAND_REVIEW", "APPROVED", "DEALING", "CONFIRMED", "THANKED");
  const brandApproved = countBy(rows, "BRAND_REVIEW", "APPROVED", "DEALING", "CONFIRMED", "THANKED");
  const confirmed = countBy(rows, "CONFIRMED", "THANKED");
  const cancelled = countBy(rows, "REJECTED");

  const columns: TableColumnsType<CampaignKocDto> = [
    {
      title: "Tên KOC",
      key: "name",
      width: 200,
      render: (_, r) => <span className="font-medium text-gray-900">{r.kocName ?? r.kocUserId}</span>,
    },
    {
      title: "Link kênh",
      dataIndex: "kocLinkTiktok",
      key: "link",
      width: 220,
      render: (v: string | null) =>
        v ? (
          <a href={v.startsWith("http") ? v : `https://${v}`} target="_blank" rel="noreferrer">
            {v}
          </a>
        ) : (
          "—"
        ),
    },
    { title: "ID Kênh", dataIndex: "kocIdTiktok", key: "idch", width: 160, render: (v: string) => v || "—" },
    { title: "Zalo / SĐT", dataIndex: "kocZalo", key: "zalo", width: 140, render: (v: string) => v || "—" },
    { title: "Địa chỉ", dataIndex: "kocTopLocation", key: "addr", width: 200, render: (v: string) => v || "—" },
    { title: "PM phụ trách", dataIndex: "pmUserId", key: "pm", width: 150, render: (v: string) => v || "—" },
    {
      title: "Trạng thái",
      key: "status",
      width: 160,
      render: (_, r) => (
        <Tag color={CAMPAIGN_KOC_STATUS_COLOR[r.status]}>{CAMPAIGN_KOC_STATUS_LABEL[r.status]}</Tag>
      ),
    },
  ];

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <Title level={5} className="!mb-0">
        Danh sách KOC tham gia
      </Title>
      <Text type="secondary" className="text-xs">
        Trạng thái tham gia &amp; thông tin liên hệ theo từng KOC
      </Text>

      {isError ? (
        <Empty className="py-10" description="Không tải được danh sách KOC tham gia" />
      ) : (
        <Spin spinning={isLoading}>
          <div className="mt-4 text-sm font-medium text-gray-700">Tổng quan KOC Tham gia</div>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile
              label="KOC mời / KPI chiến dịch"
              value={`${rows.length}${target ? `/${target}` : ""}`}
              sub={target ? `${Math.round((rows.length / target) * 100)}% mục tiêu tuyển` : undefined}
            />
            <StatTile
              label="KOC đăng ký tham gia"
              value={String(registered)}
              sub={rows.length ? `${Math.round((registered / rows.length) * 100)}% tổng lời mời` : undefined}
            />
            <StatTile label="KOC nhãn hàng duyệt" value={String(brandApproved)} sub="Đã duyệt casting" />
            <StatTile
              label="KOC xác nhận tham gia"
              value={String(confirmed)}
              tone="text-green-600"
              sub="Đã nhận & nghiệm thu hàng mẫu"
            />
            <StatTile label="KOC huỷ job" value={String(cancelled)} tone="text-red-500" sub="Từ chối lời mời" />
          </div>

          <Table<CampaignKocDto>
            className="mt-4"
            columns={columns}
            dataSource={rows}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} KOC` }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa có KOC tham gia" }}
          />
        </Spin>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tầng 5 · Nhãn hàng gửi hàng mẫu cho KOC
// (chưa có API hàng mẫu — suy diễn trạng thái từ pipeline campaign-koc)
// ════════════════════════════════════════════════════════════════════════════
type SampleStage = "not_applicable" | "not_shipped" | "shipped" | "received";

const SAMPLE_META: Record<SampleStage, { label: string; color: string }> = {
  not_applicable: { label: "Chưa tới lượt", color: "default" },
  not_shipped: { label: "Chưa gửi hàng", color: "gold" },
  shipped: { label: "Đã gửi — chờ xác nhận", color: "blue" },
  received: { label: "Đã nhận — nghiệm thu xong", color: "green" },
};

const sampleStageOf = (s: CampaignKocStatus): SampleStage => {
  if (s === "THANKED") return "received";
  if (s === "CONFIRMED") return "shipped";
  if (s === "APPROVED" || s === "DEALING" || s === "BRAND_REVIEW") return "not_shipped";
  return "not_applicable";
};

export function CampaignSamplePanel({ campaignId }: { campaignId: string }) {
  const query = useCampaignKocsQuery(campaignId);
  const { isLoading, isError } = query;
  const rows = useMemo<CampaignKocDto[]>(() => query.data ?? [], [query.data]);

  const withStage = useMemo(
    () => rows.map((r) => ({ ...r, sampleStage: sampleStageOf(r.status) })),
    [rows],
  );
  const shipped = withStage.filter((r) => r.sampleStage === "shipped").length;
  const received = withStage.filter((r) => r.sampleStage === "received").length;
  const notShipped = withStage.filter((r) => r.sampleStage === "not_shipped").length;

  const columns: TableColumnsType<(typeof withStage)[number]> = [
    {
      title: "Tên KOC",
      key: "name",
      width: 220,
      render: (_, r) => <span className="font-medium text-gray-900">{r.kocName ?? r.kocUserId}</span>,
    },
    {
      title: "Trạng thái casting",
      key: "casting",
      width: 180,
      render: (_, r) => (
        <Tag color={CAMPAIGN_KOC_STATUS_COLOR[r.status]}>{CAMPAIGN_KOC_STATUS_LABEL[r.status]}</Tag>
      ),
    },
    {
      title: "Trạng thái hàng mẫu",
      key: "sample",
      width: 200,
      render: (_, r) => (
        <Tag color={SAMPLE_META[r.sampleStage].color}>{SAMPLE_META[r.sampleStage].label}</Tag>
      ),
    },
    { title: "Địa chỉ nhận mẫu", dataIndex: "kocTopLocation", key: "addr", render: (v: string) => v || "—" },
  ];

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <Title level={5} className="!mb-0">
        Nhãn hàng gửi hàng mẫu cho KOC
      </Title>
      <Text type="secondary" className="text-xs">
        Điều kiện tiên quyết trước khi KOC quay video demo — trạng thái đang suy diễn từ pipeline
        (chưa có API hàng mẫu riêng).
      </Text>

      {isError ? (
        <Empty className="py-10" description="Không tải được dữ liệu" />
      ) : (
        <Spin spinning={isLoading}>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="KOC cần gửi mẫu" value={String(withStage.filter((r) => r.sampleStage !== "not_applicable").length)} />
            <StatTile label="Chưa gửi hàng" value={String(notShipped)} tone="text-amber-500" />
            <StatTile label="Đã gửi — chờ nhận" value={String(shipped)} tone="text-blue-600" />
            <StatTile label="Đã nghiệm thu" value={String(received)} tone="text-green-600" />
          </div>

          <Table
            className="mt-4"
            columns={columns}
            dataSource={withStage}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} KOC` }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa có KOC cần gửi mẫu" }}
          />
        </Spin>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Duyệt Video — dữ liệu thật từ /api/videos
// KOC nộp → WeWin duyệt sơ bộ → Brand duyệt → Đã duyệt (hoặc Yêu cầu sửa / Từ chối)
// ════════════════════════════════════════════════════════════════════════════
type VideoPanelMode = "ops" | "brand" | "koc";

const driveIdOf = (link?: string | null) => link?.match(/\/file\/d\/([-\w]+)/)?.[1];
const isDirectVideo = (link?: string | null) => /\.(mp4|webm|mov)(\?|$)/i.test(link ?? "");
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

function VideoPreview({ video }: { video: VideoDto }) {
  const driveId = driveIdOf(video.link);
  if (driveId) {
    return (
      <iframe
        src={`https://drive.google.com/file/d/${driveId}/preview`}
        title={video.nameVideo ?? "video"}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="aspect-video w-full rounded-lg border border-gray-200"
      />
    );
  }
  if (isDirectVideo(video.link)) {
    return (
      <video
        src={video.link ?? undefined}
        controls
        preload="metadata"
        className="aspect-video w-full rounded-lg border border-gray-200 bg-black"
      />
    );
  }
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
      {video.link ? "Không phát trực tiếp được — mở link để xem" : "Chưa có link video"}
    </div>
  );
}

export function CampaignVideoPanel({
  campaignId,
  kocUserId,
  mode = "ops",
  campaignOptions = [],
}: {
  /** Lọc theo chiến dịch. */
  campaignId?: string;
  /** Lọc theo KOC (Cổng KOC). */
  kocUserId?: string;
  /** ops = WeWin duyệt sơ bộ · brand = Brand duyệt chính thức · koc = KOC nộp / nộp lại. */
  mode?: VideoPanelMode;
  /** Cổng KOC: các chiến dịch KOC có thể nộp video. */
  campaignOptions?: { value: string; label: string }[];
}) {
  const user = authStore((s) => s.user);
  const enabled = Boolean(campaignId || kocUserId);
  const videosQ = useVideosQuery({ campaignId, kocUserId }, { enabled });
  const kocsQ = useCampaignKocsQuery(campaignId, { enabled: mode !== "koc" });
  const updateMut = useUpdateVideoMutation();
  const createMut = useCreateVideoMutation();

  const [preview, setPreview] = useState<VideoDto | null>(null);
  const [reasonFor, setReasonFor] = useState<{ video: VideoDto; status: VideoStatus } | null>(null);
  const [reason, setReason] = useState("");
  const [submitOpen, setSubmitOpen] = useState<VideoDto | "new" | null>(null);
  const [form] = Form.useForm<{ campaignId: string; nameVideo: string; link: string }>();

  const videos = videosQ.data ?? [];
  const kocNameOf = useMemo(() => {
    const m = new Map((kocsQ.data ?? []).map((k) => [k.kocUserId, k.kocName ?? k.kocUserId]));
    return (id?: string | null) => (id ? (m.get(id) ?? id) : "—");
  }, [kocsQ.data]);
  const campaignNameOf = useMemo(() => {
    const m = new Map(campaignOptions.map((c) => [c.value, c.label]));
    return (id: string) => m.get(id) ?? id;
  }, [campaignOptions]);

  const count = (...s: VideoStatus[]) => videos.filter((v) => s.includes(v.status as VideoStatus)).length;
  const actor = user?.fullName || user?.email || "";

  const setStatus = async (video: VideoDto, status: VideoStatus, note?: string) => {
    const patch: Partial<VideoRequest> = { status, note: note ?? null };
    if (mode === "brand") {
      patch.brandUserId = user?.id;
      patch.approveBy = actor;
    }
    await updateMut.mutateAsync({ video, patch });
    message.success(`Đã chuyển sang "${videoStatusMeta(status).label}"`);
  };

  const confirmReason = async () => {
    if (!reasonFor) return;
    if (!reason.trim()) {
      message.error("Vui lòng nhập lý do");
      return;
    }
    await setStatus(reasonFor.video, reasonFor.status, reason.trim());
    setReasonFor(null);
    setReason("");
  };

  const openSubmit = (target: VideoDto | "new") => {
    form.resetFields();
    if (target !== "new") {
      form.setFieldsValue({
        campaignId: target.campaignId,
        nameVideo: target.nameVideo ?? "",
        link: target.link ?? "",
      });
    } else if (campaignId) {
      form.setFieldsValue({ campaignId });
    }
    setSubmitOpen(target);
  };

  const submitVideo = async () => {
    const values = await form.validateFields();
    const body = {
      nameVideo: values.nameVideo.trim(),
      link: values.link.trim(),
      status: "WEWIN_REVIEW",
      timeUpload: new Date().toISOString(),
      note: null,
    };
    if (submitOpen === "new") {
      await createMut.mutateAsync({ ...body, campaignId: values.campaignId, kocUserId: kocUserId ?? user?.id });
    } else if (submitOpen) {
      await updateMut.mutateAsync({ video: submitOpen, patch: body });
    }
    message.success("Đã nộp video — chờ WeWin duyệt sơ bộ");
    setSubmitOpen(null);
  };

  const actions = (v: VideoDto) => {
    const s = v.status as VideoStatus;
    const btns: ReactNode[] = [
      <Button key="view" size="small" onClick={() => setPreview(v)}>
        Xem
      </Button>,
    ];
    if (mode === "ops" && s === "WEWIN_REVIEW") {
      btns.push(
        <Button key="ok" size="small" type="primary" onClick={() => setStatus(v, "BRAND_REVIEW")}>
          Đạt → gửi Brand
        </Button>,
        <Button key="rev" size="small" danger onClick={() => setReasonFor({ video: v, status: "REVISION" })}>
          Yêu cầu sửa
        </Button>,
      );
    }
    if (mode === "brand" && s === "BRAND_REVIEW") {
      btns.push(
        <Button key="ok" size="small" type="primary" onClick={() => setStatus(v, "APPROVED")}>
          Duyệt
        </Button>,
        <Button key="rev" size="small" onClick={() => setReasonFor({ video: v, status: "REVISION" })}>
          Yêu cầu sửa
        </Button>,
        <Button key="rej" size="small" danger onClick={() => setReasonFor({ video: v, status: "REJECTED" })}>
          Từ chối
        </Button>,
      );
    }
    if (mode === "koc" && s === "REVISION") {
      btns.push(
        <Button key="re" size="small" type="primary" onClick={() => openSubmit(v)}>
          Nộp lại
        </Button>,
      );
    }
    return <div className="flex flex-wrap gap-2">{btns}</div>;
  };

  const columns: TableColumnsType<VideoDto> = [
    {
      title: "Video",
      key: "name",
      width: 240,
      render: (_, v) => (
        <div className="min-w-0">
          <div className="font-medium text-gray-900">{v.nameVideo || "(không tên)"}</div>
          {v.link && (
            <a href={v.link} target="_blank" rel="noreferrer" className="block max-w-[220px] truncate text-xs">
              {v.link}
            </a>
          )}
        </div>
      ),
    },
    ...(mode !== "koc"
      ? [{ title: "KOC", key: "koc", width: 180, render: (_: unknown, v: VideoDto) => kocNameOf(v.kocUserId) }]
      : []),
    ...(!campaignId
      ? [{ title: "Chiến dịch", key: "campaign", width: 200, render: (_: unknown, v: VideoDto) => campaignNameOf(v.campaignId) }]
      : []),
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, v) => {
        const m = videoStatusMeta(v.status);
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    { title: "Ghi chú", dataIndex: "note", key: "note", width: 220, render: (n: string | null) => n || "—" },
    { title: "Ngày nộp", key: "time", width: 160, render: (_, v) => fmtDate(v.timeUpload ?? v.createdAt) },
    { title: "", key: "action", width: 260, render: (_, v) => actions(v) },
  ];

  const title =
    mode === "brand" ? "Video chờ bạn duyệt" : mode === "koc" ? "Video của bạn" : "Duyệt video KOC";

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Title level={5} className="!mb-0">
            {title}
          </Title>
          <Text type="secondary" className="text-xs">
            KOC nộp → WeWin duyệt sơ bộ → Brand duyệt chính thức.
          </Text>
        </div>
        {mode === "koc" && (
          <Button type="primary" onClick={() => openSubmit("new")} disabled={campaignOptions.length === 0}>
            Nộp video
          </Button>
        )}
      </div>

      {!enabled ? (
        <Empty className="py-10" description="Chọn một chiến dịch để xem video" />
      ) : videosQ.isError ? (
        <Empty className="py-10" description="Không tải được danh sách video" />
      ) : (
        <Spin spinning={videosQ.isLoading}>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatTile label="Tổng video" value={String(videos.length)} />
            <StatTile label="Chờ WeWin duyệt" value={String(count("WEWIN_REVIEW"))} tone="text-amber-500" />
            <StatTile label="Chờ Brand duyệt" value={String(count("BRAND_REVIEW"))} tone="text-blue-600" />
            <StatTile label="Yêu cầu sửa" value={String(count("REVISION"))} tone="text-orange-500" />
            <StatTile label="Đã duyệt" value={String(count("APPROVED"))} tone="text-green-600" />
          </div>
          <Table<VideoDto>
            className="mt-4"
            columns={columns}
            dataSource={videos}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} video` }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa có video nào" }}
          />
        </Spin>
      )}

      <Modal
        open={!!preview}
        onCancel={() => setPreview(null)}
        footer={null}
        width={820}
        title={preview?.nameVideo || "Video"}
      >
        {preview && (
          <div className="flex flex-col gap-3">
            <VideoPreview video={preview} />
            <div className="text-sm text-gray-500">
              <Tag color={videoStatusMeta(preview.status).color}>{videoStatusMeta(preview.status).label}</Tag>
              {mode !== "koc" && <>KOC: {kocNameOf(preview.kocUserId)} · </>}
              Nộp lúc {fmtDate(preview.timeUpload ?? preview.createdAt)}
              {preview.approveBy ? ` · Brand duyệt: ${preview.approveBy}` : ""}
            </div>
            {preview.link && (
              <a href={preview.link} target="_blank" rel="noreferrer" className="text-sm">
                Mở link video ↗
              </a>
            )}
            {preview.note && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                {preview.note}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!reasonFor}
        onCancel={() => setReasonFor(null)}
        onOk={confirmReason}
        confirmLoading={updateMut.isPending}
        okText={reasonFor?.status === "REJECTED" ? "Từ chối" : "Gửi yêu cầu sửa"}
        okButtonProps={{ danger: true }}
        cancelText="Huỷ"
        title={`${reasonFor?.status === "REJECTED" ? "Từ chối" : "Yêu cầu sửa"} — ${reasonFor?.video.nameVideo ?? ""}`}
      >
        <Input.TextArea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ghi rõ lý do / nội dung cần chỉnh sửa (bắt buộc)"
        />
      </Modal>

      <Modal
        open={!!submitOpen}
        onCancel={() => setSubmitOpen(null)}
        onOk={submitVideo}
        confirmLoading={createMut.isPending || updateMut.isPending}
        okText="Nộp video"
        cancelText="Huỷ"
        title={submitOpen === "new" ? "Nộp video mới" : "Nộp lại bản sửa"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="campaignId" label="Chiến dịch" rules={[{ required: true, message: "Chọn chiến dịch" }]}>
            <Select options={campaignOptions} disabled={submitOpen !== "new"} placeholder="Chọn chiến dịch" />
          </Form.Item>
          <Form.Item name="nameVideo" label="Tên video" rules={[{ required: true, message: "Nhập tên video" }]}>
            <Input placeholder="VD: Review sản phẩm - Video 1" />
          </Form.Item>
          <Form.Item
            name="link"
            label="Link video"
            rules={[
              { required: true, message: "Nhập link video" },
              { type: "url", message: "Link không hợp lệ" },
            ]}
          >
            <Input placeholder="https://drive.google.com/file/d/.../view" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}


// ── Fmt export dùng chung nếu cần ────────────────────────────────────────────
export { fmtVnd, fmtNum };
