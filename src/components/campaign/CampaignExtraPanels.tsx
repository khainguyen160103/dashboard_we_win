import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button, Card, Empty, Modal, Spin, Table, Tag, Typography, message } from "antd";
import type { TableColumnsType } from "antd";
import { useCampaignKocsQuery } from "../../hooks/query/useCampaignKocQuery";
import { useCampaign } from "../../hooks/query/useCampaignQuery";
import {
  CAMPAIGN_KOC_STATUS_LABEL,
  CAMPAIGN_KOC_STATUS_COLOR,
  type CampaignKocDto,
  type CampaignKocStatus,
} from "../../model/CampaignKoc";
import { useCampaignPicker } from "./useCampaignPicker";
import {
  JOB_STAGES,
  JOB_SYSTEM_COUNTS,
  PM_STATS,
  PRECHECK_SYSTEM,
  VIDEO_JOBS,
  brandDecideSlot,
  brandOfCampaign,
  computeJobStage,
  jobStageMeta,
  kocSubmitSlot,
  subStateMeta,
  videoSlotTimelineSteps,
  type JobStageKey,
  type Tone,
  type VideoJob,
  type VideoSlot,
} from "./campaignVideo.mock";

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
  const { data, isLoading, isError } = useCampaignKocsQuery(campaignId);
  const { data: campaign } = useCampaign(campaignId);
  const rows = useMemo(() => data ?? [], [data]);

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
  const { data, isLoading, isError } = useCampaignKocsQuery(campaignId);
  const rows = useMemo(() => data ?? [], [data]);

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
// Tầng 6 · Job & Duyệt Video  (mock demo — 1 Job = 1 KOC, Video 1 & Video 2 riêng;
// mỗi video tối đa 2 vòng sửa trước DUYỆT FINAL → lên sóng (air) + code ads)
// ════════════════════════════════════════════════════════════════════════════
const TONE_TAG_COLOR: Record<Tone, string> = {
  neutral: "default",
  warn: "gold",
  good: "green",
  crit: "red",
};
const TONE_TEXT_CLASS: Record<Tone, string> = {
  neutral: "text-gray-500",
  warn: "text-amber-500",
  good: "text-green-600",
  crit: "text-red-500",
};
const STEP_TEXT: Record<string, string> = {
  done: "text-green-600",
  current: "text-amber-500",
  rejected: "text-red-500",
  upcoming: "text-gray-400",
};
const STEP_DOT: Record<string, string> = {
  done: "bg-green-500",
  current: "bg-amber-400",
  rejected: "bg-red-500",
  upcoming: "bg-gray-300",
};

function VideoSlotTag({ slot }: { slot: VideoSlot }) {
  const m = subStateMeta(slot.status);
  return <Tag color={TONE_TAG_COLOR[m.tone]}>{m.short}</Tag>;
}

function SlotTimeline({ label, slot }: { label: string; slot: VideoSlot }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="flex flex-col gap-3">
        {videoSlotTimelineSteps(slot).map((s, i) => (
          <div key={i} className="flex gap-3">
            <span className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${STEP_DOT[s.state]}`} />
            <div>
              <div className="text-sm font-medium text-gray-900">{s.label}</div>
              <div className={`text-xs ${STEP_TEXT[s.state]}`}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Trình phát video ngay trong web.
//  - Có `videoUrl` (mp4/webm) → thẻ <video> gốc (dùng cho demo).
//  - Chỉ có `driveFileId` → nhúng Google Drive: https://drive.google.com/file/d/<id>/preview
//    (file phải được share "Bất kỳ ai có đường liên kết").
function VideoPlayer({ label, slot }: { label: string; slot: VideoSlot }) {
  const canPlay = Boolean(slot.videoUrl || slot.driveFileId);
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label} — bản video
      </div>
      {slot.videoUrl ? (
        <video
          src={slot.videoUrl}
          controls
          preload="metadata"
          className="aspect-video w-full rounded-lg border border-gray-200 bg-black"
        />
      ) : slot.driveFileId ? (
        <iframe
          src={`https://drive.google.com/file/d/${slot.driveFileId}/preview`}
          title={`${label} — video`}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="aspect-video w-full rounded-lg border border-gray-200"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
          Chưa có bản video
        </div>
      )}
      {canPlay && slot.airLink && (
        <div className="mt-1 truncate text-xs text-gray-400">
          Link air: {slot.airLink}
          {slot.adsCode ? ` · Code ads: ${slot.adsCode}` : ""}
        </div>
      )}
    </div>
  );
}

export function CampaignVideoPanel({
  campaignId: _campaignId,
  brandName,
  canBrandApprove = false,
  kocName,
  canKocUpload = false,
}: {
  campaignId?: string;
  /** Nếu truyền (góc nhìn Cổng Brand) → chỉ hiển thị chiến dịch của nhãn hàng này. */
  brandName?: string;
  /** Bật nút Duyệt / Yêu cầu sửa video cho Brand. */
  canBrandApprove?: boolean;
  /** Nếu truyền (góc nhìn Cổng KOC) → chỉ hiển thị job của KOC này. */
  kocName?: string;
  /** Bật nút Nộp / Nộp lại video cho KOC. */
  canKocUpload?: boolean;
}) {
  // null = xem bảng tổng hợp tất cả chiến dịch; có tên = drill-down video của chiến dịch đó
  const [detailCampaign, setDetailCampaign] = useState<string | null>(null);
  const [openJob, setOpenJob] = useState<VideoJob | null>(null);
  // Bản sao thay đổi được trong phiên (Brand duyệt / KOC nộp video)
  const [jobsAll, setJobsAll] = useState<VideoJob[]>(VIDEO_JOBS);
  const filter = detailCampaign ?? "";
  const hideOpsTiers = Boolean(kocName); // KOC không cần xem casting/hàng mẫu & năng suất PM

  // Giới hạn phạm vi: theo Brand (Cổng Brand) hoặc theo KOC (Cổng KOC)
  const scoped = useMemo(() => {
    let list = jobsAll;
    if (brandName) list = list.filter((j) => brandOfCampaign(j.campaign) === brandName);
    if (kocName) list = list.filter((j) => j.koc === kocName);
    return list;
  }, [jobsAll, brandName, kocName]);
  const jobs = useMemo(
    () => (filter ? scoped.filter((v) => v.campaign === filter) : scoped),
    [filter, scoped],
  );

  const scopedView = Boolean(brandName) || Boolean(kocName) || Boolean(filter);
  const counts = useMemo<Record<JobStageKey, number>>(() => {
    if (!scopedView) return { ...JOB_SYSTEM_COUNTS };
    const c: Record<JobStageKey, number> = { producing: 0, reviewing: 0, final_air: 0, rejected: 0 };
    jobs.forEach((j) => {
      c[computeJobStage(j)]++;
    });
    return c;
  }, [scopedView, jobs]);
  const stageTotal = Object.values(counts).reduce((s, n) => s + n, 0);
  const maxCount = Math.max(1, ...Object.values(counts));

  // Video KOC đã nộp + WeWin đã duyệt sơ bộ — đang chờ Brand duyệt chính thức
  const pendingBrand = useMemo(
    () =>
      scoped.flatMap((j) =>
        (["video1", "video2"] as const)
          .filter((k) => j[k].status === "brand_review")
          .map((k) => ({ job: j, slotKey: k })),
      ),
    [scoped],
  );

  const applyDecision = (
    job: VideoJob,
    slotKey: "video1" | "video2",
    decision: "approve" | "revise",
    reason?: string,
  ) => {
    const next = brandDecideSlot(job[slotKey], decision, reason);
    setJobsAll((prev) => prev.map((j) => (j.id === job.id ? { ...j, [slotKey]: next } : j)));
    setOpenJob((o) => (o && o.id === job.id ? { ...o, [slotKey]: next } : o));
  };
  const approveVideo = (job: VideoJob, slotKey: "video1" | "video2") => {
    applyDecision(job, slotKey, "approve");
    message.success(`Đã duyệt ${slotKey === "video1" ? "Video 1" : "Video 2"} — ${job.koc}`);
  };
  const requestRevision = (job: VideoJob, slotKey: "video1" | "video2") => {
    let reason = "";
    Modal.confirm({
      title: `Yêu cầu sửa ${slotKey === "video1" ? "Video 1" : "Video 2"} — ${job.koc}`,
      content: (
        <textarea
          className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          rows={3}
          placeholder="Ghi rõ nội dung cần chỉnh sửa (bắt buộc)"
          onChange={(e) => (reason = e.target.value)}
        />
      ),
      okText: "Gửi yêu cầu sửa",
      okButtonProps: { danger: true },
      cancelText: "Huỷ",
      onOk: () => {
        if (!reason.trim()) {
          message.error("Vui lòng nhập lý do");
          return Promise.reject();
        }
        applyDecision(job, slotKey, "revise", reason.trim());
        message.success("Đã gửi yêu cầu sửa cho KOC");
      },
    });
  };

  // ── KOC nộp / nộp lại video ──────────────────────────────────────────────
  const KOC_SUBMITTABLE = ["awaiting_demo", "revise_r1", "revise_r2"];
  const uploadLabel = (slot: VideoSlot) =>
    slot.status === "awaiting_demo" ? "Nộp video" : "Nộp lại bản sửa";
  const kocPending = useMemo(
    () =>
      scoped.flatMap((j) =>
        (["video1", "video2"] as const)
          .filter((k) => KOC_SUBMITTABLE.includes(j[k].status))
          .map((k) => ({ job: j, slotKey: k })),
      ),
    [scoped],
  );
  const submitVideo = (job: VideoJob, slotKey: "video1" | "video2") => {
    let url = "";
    Modal.confirm({
      title: `${uploadLabel(job[slotKey])} — ${slotKey === "video1" ? "Video 1" : "Video 2"} · ${job.campaign}`,
      content: (
        <div>
          <p className="text-xs text-gray-500">
            Dán link video (Google Drive / YouTube / MP4). Bỏ trống sẽ dùng video mẫu để demo.
          </p>
          <input
            className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="https://drive.google.com/file/d/.../view"
            onChange={(e) => (url = e.target.value)}
          />
        </div>
      ),
      okText: "Nộp video",
      cancelText: "Huỷ",
      onOk: () => {
        const raw = url.trim();
        const drive = raw.match(/\/file\/d\/([-\w]+)/);
        let next = kocSubmitSlot(job[slotKey], drive ? "" : raw || undefined);
        if (drive) next = { ...next, driveFileId: drive[1], videoUrl: undefined };
        setJobsAll((prev) => prev.map((j) => (j.id === job.id ? { ...j, [slotKey]: next } : j)));
        setOpenJob((o) => (o && o.id === job.id ? { ...o, [slotKey]: next } : o));
        message.success("Đã nộp video — chờ WeWin duyệt sơ bộ");
      },
    });
  };

  // Tầng 3 · Năng suất theo PM — không scope: số hệ thống; có scope: tính thật từ jobs
  const pmRows = useMemo(() => {
    if (!scopedView) {
      return PM_STATS.map((p) => ({
        name: p.name,
        approved: p.approved,
        rejected: p.rejected,
        sla: p.sla as number | null,
      }));
    }
    const byPm = new Map<string, { approved: number; rejected: number; sla: number; n: number }>();
    jobs.forEach((j) => {
      const key = j.pm || "—";
      const row = byPm.get(key) ?? { approved: 0, rejected: 0, sla: 0, n: 0 };
      const st = computeJobStage(j);
      if (st === "final_air") row.approved++;
      if (st === "rejected") row.rejected++;
      row.sla += j.hoursInStage;
      row.n += 1;
      byPm.set(key, row);
    });
    return [...byPm.entries()].map(([name, r]) => ({
      name,
      approved: r.approved,
      rejected: r.rejected,
      sla: (r.n ? Number((r.sla / r.n).toFixed(1)) : null) as number | null,
    }));
  }, [scopedView, jobs]);

  const pmColumns: TableColumnsType<(typeof pmRows)[number]> = [
    { title: "PM", dataIndex: "name", key: "name", render: (v: string) => <span className="font-medium text-gray-900">{v}</span> },
    { title: "Đã duyệt", dataIndex: "approved", key: "approved", align: "right", render: (v: number) => fmtNum(v) },
    { title: "Từ chối", dataIndex: "rejected", key: "rejected", align: "right", render: (v: number) => fmtNum(v) },
    { title: "SLA TB", dataIndex: "sla", key: "sla", align: "right", render: (v: number | null) => (v == null ? "—" : `${v}h`) },
  ];

  const jobColumns: TableColumnsType<VideoJob> = [
    { title: "KOC", key: "koc", width: 180, render: (_, j) => <span className="font-medium text-gray-900">{j.koc}</span> },
    { title: "Chiến dịch", dataIndex: "campaign", key: "campaign", width: 200 },
    { title: "PM", key: "pm", width: 120, render: (_, j) => j.pm || "—" },
    {
      title: "Trạng thái Job",
      key: "stage",
      width: 150,
      render: (_, j) => {
        const m = jobStageMeta(computeJobStage(j));
        return <Tag color={TONE_TAG_COLOR[m.tone]}>{m.short}</Tag>;
      },
    },
    { title: "Video 1", key: "v1", width: 130, render: (_, j) => <VideoSlotTag slot={j.video1} /> },
    { title: "Video 2", key: "v2", width: 130, render: (_, j) => <VideoSlotTag slot={j.video2} /> },
    {
      title: "Drive",
      key: "drive",
      width: 240,
      render: (_, j) => (
        <a
          href={`https://${j.driveFolder.replace(/^https?:\/\//, "")}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs"
        >
          📁 {j.driveFolder}
        </a>
      ),
    },
    {
      title: "",
      key: "action",
      width: 130,
      render: (_, j) => (
        <Button type="link" size="small" onClick={() => setOpenJob(j)}>
          ▶ Xem &amp; chi tiết
        </Button>
      ),
    },
  ];

  // Bảng tổng hợp: 1 dòng / chiến dịch (trong phạm vi đang xem) — bấm "Xem chi tiết" để drill-down
  const campaignRows = useMemo(() => {
    const names = [...new Set(scoped.map((j) => j.campaign))].sort((a, b) =>
      a.localeCompare(b, "vi"),
    );
    return names.map((name) => {
      const list = scoped.filter((j) => j.campaign === name);
      const c: Record<JobStageKey, number> = { producing: 0, reviewing: 0, final_air: 0, rejected: 0 };
      list.forEach((j) => {
        c[computeJobStage(j)]++;
      });
      return {
        campaign: name,
        total: list.length,
        producing: c.producing,
        reviewing: c.reviewing,
        final_air: c.final_air,
        rejected: c.rejected,
      };
    });
  }, [scoped]);

  const campaignColumns: TableColumnsType<(typeof campaignRows)[number]> = [
    {
      title: "Chiến dịch",
      dataIndex: "campaign",
      key: "campaign",
      render: (v: string) => <span className="font-medium text-gray-900">{v}</span>,
    },
    { title: "Tổng job", dataIndex: "total", key: "total", align: "right", width: 100 },
    { title: "Đang sản xuất", dataIndex: "producing", key: "producing", align: "right", width: 130 },
    { title: "Đang duyệt", dataIndex: "reviewing", key: "reviewing", align: "right", width: 120 },
    {
      title: "Hoàn tất",
      dataIndex: "final_air",
      key: "final_air",
      align: "right",
      width: 100,
      render: (v: number) => <span className="text-green-600">{v}</span>,
    },
    {
      title: "Từ chối / Huỷ",
      dataIndex: "rejected",
      key: "rejected",
      align: "right",
      width: 120,
      render: (v: number) => <span className="text-red-500">{v}</span>,
    },
    {
      title: "",
      key: "action",
      width: 130,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => setDetailCampaign(r.campaign)}>
          Xem chi tiết →
        </Button>
      ),
    },
  ];

  // Bảng drill-down bỏ cột "Chiến dịch" (đã hiển thị ở tiêu đề)
  const detailJobColumns = jobColumns.filter((c) => c.key !== "campaign");

  const openStage = openJob ? computeJobStage(openJob) : null;
  const rejectReason =
    openJob && openStage === "rejected"
      ? openJob.cancelled
        ? openJob.cancelReason
        : openJob.video1.status === "rejected"
          ? openJob.video1.rejectionReason
          : openJob.video2.rejectionReason
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Video KOC chờ Brand duyệt (chỉ hiện ở góc nhìn Cổng Brand) */}
      {canBrandApprove && (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <Title level={5} className="!mb-0">
            Video KOC chờ bạn duyệt
          </Title>
          <Text type="secondary" className="text-xs">
            KOC đã nộp &amp; WeWin đã duyệt sơ bộ — bấm &quot;Xem&quot; để phát video rồi Duyệt hoặc Yêu
            cầu sửa.
            {brandName ? ` Chỉ gồm chiến dịch của ${brandName}.` : ""}
          </Text>
          {pendingBrand.length === 0 ? (
            <Empty className="py-6" description="Không có video nào đang chờ bạn duyệt" />
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {pendingBrand.map(({ job, slotKey }) => (
                <div
                  key={`${job.id}-${slotKey}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">
                      {job.koc} · {slotKey === "video1" ? "Video 1" : "Video 2"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {job.campaign}
                      {job.pm ? ` · PM: ${job.pm}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="small" onClick={() => setOpenJob(job)}>
                      ▶ Xem
                    </Button>
                    <Button size="small" type="primary" onClick={() => approveVideo(job, slotKey)}>
                      Duyệt
                    </Button>
                    <Button size="small" danger onClick={() => requestRevision(job, slotKey)}>
                      Yêu cầu sửa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Video KOC cần nộp / nộp lại (chỉ hiện ở góc nhìn Cổng KOC) */}
      {canKocUpload && (
        <Card className="rounded-2xl border border-blue-200 bg-blue-50/40 shadow-sm">
          <Title level={5} className="!mb-0">
            Video bạn cần nộp
          </Title>
          <Text type="secondary" className="text-xs">
            Bấm &quot;Nộp&quot; để tải video lên cho chiến dịch — WeWin duyệt sơ bộ rồi tới Brand duyệt
            chính thức.
            {kocName ? ` Đang xem với tư cách: ${kocName}.` : ""}
          </Text>
          {kocPending.length === 0 ? (
            <Empty className="py-6" description="Bạn không có video nào cần nộp" />
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {kocPending.map(({ job, slotKey }) => {
                const slot = job[slotKey];
                return (
                  <div
                    key={`${job.id}-${slotKey}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">
                        {job.campaign} · {slotKey === "video1" ? "Video 1" : "Video 2"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {subStateMeta(slot.status).label}
                        {slot.round2Note
                          ? ` · ${slot.round2Note}`
                          : slot.round1Note
                            ? ` · ${slot.round1Note}`
                            : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="small" onClick={() => setOpenJob(job)}>
                        Xem
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => submitVideo(job, slotKey)}
                      >
                        {uploadLabel(slot)}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tầng 1 · Trước khi vào luồng Video (ẩn ở góc nhìn Cổng KOC) */}
      {!hideOpsTiers && (
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <Title level={5} className="!mb-0">
            Casting &amp; hàng mẫu — theo đúng quy trình vận hành thật
          </Title>
          <Text type="secondary" className="text-xs">
            Đối chiếu theo file Sheet vận hành thật (DS ĐĂNG KÝ / DS đi hàng ngoài / Nghiệm thu hàng
            mẫu / DS HUỶ) — số liệu tham khảo cấp hệ thống, 3 mảng này chưa có module quản lý riêng
            trên dashboard, đề xuất xây ở đợt sau (xem Dev Guide 2.7).
          </Text>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile
              label="KOC chờ duyệt casting"
              value={String(PRECHECK_SYSTEM.pendingCasting)}
              sub={'Tab "DS ĐĂNG KÝ" — nhãn Duyệt / Loại / Còn nhắc'}
            />
            <StatTile
              label="KOC chờ nhận hàng mẫu"
              value={String(PRECHECK_SYSTEM.waitingSample)}
              sub={'Đã gửi hàng, chưa xác nhận ở "Nghiệm thu hàng mẫu"'}
            />
            <StatTile
              label="KOC đã huỷ (tháng này)"
              value={String(PRECHECK_SYSTEM.cancelled)}
              tone="text-red-500"
              sub={'Tab "DS HUỶ" — lý do: cast fee, phân loại hộp mẫu…'}
            />
          </div>
        </Card>
      )}

      {/* Tầng 2 · Tổng quan theo giai đoạn xử lý */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <Title level={5} className="!mb-0">
          Tầng 2 · Tổng quan theo giai đoạn xử lý
        </Title>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {JOB_STAGES.map((s) => (
            <StatTile
              key={s.key}
              label={s.label}
              value={String(counts[s.key])}
              tone={TONE_TEXT_CLASS[s.tone]}
            />
          ))}
        </div>
      </Card>

      {/* Tầng 3 · Năng suất PM (ẩn với KOC) + Phân bổ Job theo giai đoạn */}
      <div className={`grid grid-cols-1 gap-4 ${hideOpsTiers ? "" : "lg:grid-cols-2"}`}>
        {!hideOpsTiers && (
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <Title level={5} className="!mb-0">
              Năng suất theo PM
            </Title>
            <Text type="secondary" className="text-xs">
              Số video đã xử lý &amp; SLA trung bình
            </Text>
            <Table
              className="mt-4"
              columns={pmColumns}
              dataSource={pmRows}
              rowKey="name"
              size="small"
              pagination={false}
            />
          </Card>
        )}

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <Title level={5} className="!mb-0">
            Phân bổ Job theo giai đoạn
          </Title>
          <Text type="secondary" className="text-xs">
            {fmtNum(stageTotal)} job video (KOC){filter ? ` của "${filter}"` : " trong kỳ"}
          </Text>
          <div className="mt-4 flex flex-col gap-3">
            {JOB_STAGES.map((s) => {
              const v = counts[s.key];
              return (
                <div key={s.key} className="grid grid-cols-[110px_1fr_70px] items-center gap-3">
                  <span className="truncate text-xs font-medium text-gray-600">{s.short}</span>
                  <span className="h-3 rounded bg-gray-100">
                    <span
                      className={`block h-3 rounded ${
                        s.key === "final_air"
                          ? "bg-green-500"
                          : s.key === "rejected"
                            ? "bg-red-400"
                            : "bg-amber-400"
                      }`}
                      style={{ width: `${Math.max(2, Math.round((v / maxCount) * 100))}%` }}
                    />
                  </span>
                  <span className="text-right font-mono text-xs text-gray-600">{fmtNum(v)} job</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bảng chiến dịch ↔ drill-down toàn bộ video của chiến dịch được chọn */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        {detailCampaign === null ? (
          <>
            <Title level={5} className="!mb-0">
              {kocName
                ? "Chiến dịch bạn tham gia"
                : brandName
                  ? "Chiến dịch của bạn"
                  : "Tất cả chiến dịch"}
            </Title>
            <Text type="secondary" className="text-xs">
              Bấm &quot;Xem chi tiết&quot; để xem toàn bộ video của chiến dịch đó cùng trạng thái xử lý.
            </Text>
            <Table
              className="mt-4"
              columns={campaignColumns}
              dataSource={campaignRows}
              rowKey="campaign"
              size="middle"
              pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} chiến dịch` }}
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "Chưa có chiến dịch nào" }}
            />
          </>
        ) : (
          <>
            <Button type="link" className="!mb-2 !px-0" onClick={() => setDetailCampaign(null)}>
              ← Quay lại danh sách chiến dịch
            </Button>
            <Title level={5} className="!mb-0">
              Video của chiến dịch — {detailCampaign}
            </Title>
            <Text type="secondary" className="text-xs">
              {jobs.length} job video · bấm &quot;Chi tiết&quot; để xem dòng thời gian Video 1 &amp; Video 2.
            </Text>
            <Table<VideoJob>
              className="mt-4"
              columns={detailJobColumns}
              dataSource={jobs}
              rowKey="id"
              size="middle"
              pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} Job` }}
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "Chưa có video nào cho chiến dịch này" }}
            />
          </>
        )}
      </Card>

      {/* Modal chi tiết Job Video */}
      <Modal
        open={!!openJob}
        onCancel={() => setOpenJob(null)}
        footer={null}
        width={900}
        title={openJob ? openJob.koc : ""}
      >
        {openJob && (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-500">
              {openJob.campaign}
              {openJob.pm ? ` · PM: ${openJob.pm}` : ""} ·{" "}
              <Tag color={TONE_TAG_COLOR[jobStageMeta(computeJobStage(openJob)).tone]}>
                {jobStageMeta(computeJobStage(openJob)).short}
              </Tag>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-900">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Nguồn video
              </span>{" "}
              · Lưu trên Google Drive do WEWIN cấp link ·{" "}
              <a
                href={`https://${openJob.driveFolder.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                📁 {openJob.driveFolder}
              </a>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {(["video1", "video2"] as const).map((k) => {
                const label = k === "video1" ? "Video 1" : "Video 2";
                return (
                  <div key={k} className="flex flex-col gap-3">
                    <VideoPlayer label={label} slot={openJob[k]} />
                    {canBrandApprove && openJob[k].status === "brand_review" && (
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => approveVideo(openJob, k)}
                        >
                          Duyệt {label}
                        </Button>
                        <Button size="small" danger onClick={() => requestRevision(openJob, k)}>
                          Yêu cầu sửa
                        </Button>
                      </div>
                    )}
                    {canKocUpload && KOC_SUBMITTABLE.includes(openJob[k].status) && (
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => submitVideo(openJob, k)}
                        >
                          {uploadLabel(openJob[k])} — {label}
                        </Button>
                      </div>
                    )}
                    <SlotTimeline label={label} slot={openJob[k]} />
                  </div>
                );
              })}
            </div>

            {rejectReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-red-500">
                  {openJob.cancelled ? "Lý do KOC huỷ job" : "Lý do từ chối hẳn"}
                </div>
                <div className="mt-1 text-sm text-red-600">{rejectReason}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Fmt export dùng chung nếu cần ────────────────────────────────────────────
export { fmtVnd, fmtNum };

// ════════════════════════════════════════════════════════════════════════════
// Tab wrappers (Quản lý chiến dịch)
// ════════════════════════════════════════════════════════════════════════════
function PickerTab({ render }: { render: (campaignId: string) => ReactNode }) {
  const { picker, campaignId } = useCampaignPicker();
  return (
    <div className="flex flex-col gap-4">
      {picker}
      {campaignId ? render(campaignId) : <Empty description="Chưa có chiến dịch nào" />}
    </div>
  );
}

export const CampaignRosterTab = () => (
  <PickerTab render={(id) => <CampaignRosterPanel campaignId={id} />} />
);
export const CampaignSampleTab = () => (
  <PickerTab render={(id) => <CampaignSamplePanel campaignId={id} />} />
);
// Tab "Job & Duyệt Video" tự có bộ lọc chiến dịch riêng (mặc định "Tất cả chiến dịch"),
// giống bản demo — không dùng chung PickerTab.
export const CampaignVideoTab = () => <CampaignVideoPanel />;
