import { useMemo } from "react";
import { Card, Select, Table, Typography, message } from "antd";
import type { TableColumnsType } from "antd";
import type { Campaign } from "../model/Campaign";
import type { CampaignKocDto } from "../model/CampaignKoc";
import { authStore } from "../../../store/authStore";
import { getActiveUserRole } from "../../../utils/rbac";
import {
  buildTimeline,
  flowKey,
  fmtVND,
  isFinalConfirmed,
  isRegistered,
  opsStaffOf,
  useCampaignFlowStore,
  type VideoCounts,
} from "../utils/campaignFlow";
import { EmptyNote, StatGrid } from "./detailUi";
import { useOpsStaffQuery } from "../hook/useOpsStaffQuery";

const { Title, Text } = Typography;

type CampaignExtra = Campaign & {
  pmName?: string;
  budgetUsed?: number;
  budgetTotal?: number;
  gmv?: number;
};

const STEP_STATE = {
  done: { bar: "bg-green-600", st: "text-green-700", label: "✓ Hoàn tất" },
  current: { bar: "bg-amber-400", st: "text-amber-700", label: "● Đang thực hiện" },
  upcoming: { bar: "bg-gray-200", st: "text-gray-500", label: "Chưa tới" },
};

export function CampaignDetailOverview({
  campaign,
  rows,
  video,
}: {
  campaign: CampaignExtra;
  rows: CampaignKocDto[];
  video: VideoCounts;
}) {
  const user = authStore((s) => s.user);
  const role = getActiveUserRole(user);
  const editable = role === "ADMIN" || role === "PM";

  const total = rows.length;
  const confirmed = rows.filter(isRegistered).length;
  const pendingReview = Math.max(0, video.submitted - video.approved);
  const kpiTarget = Number(campaign.targetTotalKoc ?? 0) || total;
  const timeline = useMemo(() => buildTimeline(rows, kpiTarget, video), [rows, kpiTarget, video]);

  // ── Đội Nhân sự Vận hành ──
  const opsStaffQ = useOpsStaffQuery();
  const fullTeam = opsStaffQ.data ?? [];
  const storedTeam = useCampaignFlowStore((s) => s.opsTeam[campaign.id]);
  const overrides = useCampaignFlowStore((s) => s.opsOverride);
  const setOpsTeam = useCampaignFlowStore((s) => s.setOpsTeam);
  const setOpsOverride = useCampaignFlowStore((s) => s.setOpsOverride);
  const team = storedTeam?.length ? storedTeam : fullTeam;
  const assignRows = rows.filter(isFinalConfirmed);

  const toggleMember = (name: string) => {
    if (team.includes(name)) {
      if (team.length <= 1) {
        message.warning("Đội cần ít nhất 1 Nhân viên Vận hành — không thể rút người cuối cùng khỏi chiến dịch.");
        return;
      }
      setOpsTeam(campaign.id, team.filter((n) => n !== name));
    } else {
      setOpsTeam(campaign.id, [...team, name]);
    }
  };

  const assignColumns: TableColumnsType<CampaignKocDto> = [
    { title: "KOC", key: "koc", render: (_, r) => <span className="font-bold">{r.kocName ?? r.kocUserId}</span> },
    {
      title: "Nhân sự Vận hành phụ trách",
      key: "ops",
      render: (_, r) => (
        <Select
          size="small"
          className="min-w-[180px]"
          disabled={!editable}
          placeholder="Chưa phân công"
          value={opsStaffOf(team, overrides[flowKey(r)])}
          options={team.map((n) => ({ value: n, label: n }))}
          onChange={(v) => setOpsOverride(flowKey(r), v)}
        />
      ),
    },
  ];

  const hasBudget = campaign.budgetTotal != null && campaign.budgetUsed != null && campaign.budgetTotal > 0;

  return (
    <div className="flex flex-col gap-4">
      <StatGrid
        cols={4}
        items={[
          {
            t: "Tổng số KOC",
            v: String(total),
            note: `${confirmed}/${total} đã xác nhận tham gia (${total ? Math.round((confirmed / total) * 100) : 0}%)`,
          },
          { t: "Tổng số video", v: `${video.submitted}/${video.assigned} video`, note: "đã nộp / tổng cần nộp" },
          { t: "Video đã duyệt", v: String(video.approved), note: `trên tổng ${video.assigned} video giao` },
          {
            t: "Video chờ duyệt / cần chỉnh sửa",
            v: String(pendingReview),
            d: pendingReview > 0 ? "Cần Account xử lý" : undefined,
            dtone: "warn",
          },
        ]}
      />

      <StatGrid
        cols={2}
        items={[
          hasBudget
            ? {
                t: "Ngân sách đã dùng",
                v: `${Math.round((campaign.budgetUsed! / campaign.budgetTotal!) * 100)}%`,
                note: `${fmtVND(campaign.budgetUsed)} / ${fmtVND(campaign.budgetTotal)}`,
              }
            : { t: "Ngân sách đã dùng", v: "—", note: "Chưa có dữ liệu ngân sách" },
          { t: "GMV tạo ra", v: campaign.gmv != null ? fmtVND(campaign.gmv) : "—" },
        ]}
      />

      <Card className="rounded-xl border border-gray-200 shadow-sm">
        <Title level={5} className="!mb-0 !text-[14.5px]">
          Tiến trình chiến dịch
        </Title>
        <Text type="secondary" className="text-xs">
          6 mốc chuẩn — trạng thái tính theo % tiến độ thời gian
        </Text>
        <div className="mt-4 grid grid-cols-3 gap-4 lg:grid-cols-6">
          {timeline.map((s) => (
            <div key={s.label} className="flex flex-col gap-2">
              <div className={`h-1.5 rounded ${STEP_STATE[s.state].bar}`} />
              <div className="text-[11.5px] font-semibold leading-tight text-gray-700">{s.label}</div>
              <div className={`font-mono text-[10.5px] ${STEP_STATE[s.state].st}`}>{STEP_STATE[s.state].label}</div>
              <div className="text-[11px] leading-snug text-gray-500">{s.note}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-xl border border-gray-200 shadow-sm">
        <Title level={5} className="!mb-0 !text-[14.5px]">
          Đội Nhân sự Vận hành
        </Title>
        <Text type="secondary" className="text-xs">
          PM <b>{campaign.pmName ?? "—"}</b> quản lý đội Nhân viên Vận hành cho riêng chiến dịch này — bấm để thêm
          hoặc rút người khỏi đội.
        </Text>
        {!editable && (
          <div className="mt-3 text-xs font-bold text-amber-700">
            🔒 Vai hiện tại chỉ xem — chỉ PM (hoặc Admin) mới thêm/bớt người hoặc phân công lại.
          </div>
        )}
        <div className="mb-4 mt-3 flex flex-wrap gap-2">
          {fullTeam.length === 0 ? (
            <EmptyNote>Chưa có tài khoản Nhân sự Vận hành (role OP) nào trong hệ thống.</EmptyNote>
          ) : (
            fullTeam.map((name) => {
              const active = team.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  disabled={!editable}
                  title={!editable ? "Vai hiện tại không có quyền sửa" : active ? "Bấm để rút khỏi đội" : "Bấm để thêm vào đội"}
                  onClick={() => toggleMember(name)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? "border-teal-700/30 bg-teal-50 text-teal-900"
                      : "border-gray-200 bg-white text-gray-400 line-through"
                  } ${editable ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                >
                  <i className={`inline-block h-1.5 w-1.5 rounded-full ${active ? "bg-teal-700" : "bg-gray-300"}`} />
                  {name}
                  {active ? "" : " — không trong đội"}
                </button>
              );
            })
          )}
        </div>
        <div className="mb-2 text-xs font-bold text-gray-700">
          Phân công KOC ↔ Nhân viên Vận hành (KOC đã hoàn tất Bước 5 · Xác nhận &amp; Triển khai)
        </div>
        {assignRows.length === 0 ? (
          <EmptyNote>
            Chưa có KOC nào hoàn tất Bước 5 "Xác nhận &amp; Triển khai" để phân công Nhân viên Vận hành — xem tab
            "Xác nhận &amp; Triển khai".
          </EmptyNote>
        ) : (
          <Table<CampaignKocDto>
            size="small"
            rowKey="id"
            columns={assignColumns}
            dataSource={assignRows}
            pagination={assignRows.length > 10 ? { pageSize: 10 } : false}
          />
        )}
      </Card>
    </div>
  );
}
