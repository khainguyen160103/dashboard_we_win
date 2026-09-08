import { useMemo, useState } from "react";
import { Alert, Empty, Select, Spin, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { authStore } from "../../store/authStore";
import { useMyJobsQuery } from "../../hooks/query/useJobQuery";
import { fmtVnd, PanelCard, StatTile } from "./_shared";
import { MOCK_MY_JOBS, withFallback } from "./mockData";
import { CampaignVideoPanel } from "../../components/campaign/CampaignExtraPanels";
import { KOC_NAMES } from "../../components/campaign/campaignVideo.mock";

const { Title, Text } = Typography;

// Minh hoạ hoa hồng / GMV đóng góp (BE chưa trả các số này theo job)
const COMMISSION_RATE = 0.12;
const GMV_PER_APPROVED_VIDEO = 12_500_000;

const vStatus = (j: any) => String(j.videoStatus || j.status || "").toUpperCase();
const isApproved = (j: any) => ["DA_PHE_DUYET", "APPROVED"].includes(vStatus(j));
const isRevision = (j: any) => ["TU_CHOI", "REJECTED"].includes(vStatus(j));
const isSubmitted = (j: any) => ["CHO_PM_DUYET", "PENDING"].includes(vStatus(j));
const invAccepted = (j: any) => {
  const s = String(j.invitationStatus || "").toUpperCase();
  return s !== "INVITED" && s !== "REJECTED";
};
const invRejected = (j: any) => String(j.invitationStatus || "").toUpperCase() === "REJECTED";

type Group = {
  key: string;
  name: string;
  brand: string;
  jobs: any[];
  total: number;
  approved: number;
  pending: number;
  accepted: boolean;
  rejected: boolean;
  done: boolean;
  gmv: number;
  commission: number;
};

function statusLabel(g: Group): { label: string; color: string } {
  if (g.rejected) return { label: "Đã từ chối", color: "text-red-500" };
  if (!g.accepted) return { label: "Chờ phản hồi lời mời", color: "text-amber-600" };
  if (g.done) return { label: "Đã hoàn thành", color: "text-emerald-600" };
  return { label: "Đang tham gia", color: "text-emerald-600" };
}

export default function KocPortalDashboard() {
  const user = authStore((s) => s.user);
  const query = useMyJobsQuery({ enabled: true });
  const { isLoading } = query;
  const { rows: jobs, usingMock } = useMemo(
    () => withFallback<any>(query, MOCK_MY_JOBS),
    [query.data, query.isError, query.isLoading],
  );

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, any[]>();
    jobs.forEach((j) => {
      const key = String(j.campaignName || j.campaignId || "—");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j);
    });
    return [...map.entries()].map(([key, js]) => {
      const approved = js.filter(isApproved).length;
      const total = js.length;
      return {
        key,
        name: js[0]?.campaignName || key,
        brand: js[0]?.brandName || js[0]?.campaign?.brandName || "—",
        jobs: js,
        total,
        approved,
        pending: js.filter((j) => isSubmitted(j) || isRevision(j)).length,
        accepted: js.some(invAccepted),
        rejected: js.length > 0 && js.every(invRejected),
        done: total > 0 && approved === total,
        gmv: approved * GMV_PER_APPROVED_VIDEO,
        commission: Math.round(approved * GMV_PER_APPROVED_VIDEO * COMMISSION_RATE),
      };
    });
  }, [jobs]);

  const activeGroups = groups.filter((g) => !g.rejected && !g.done);
  const historyGroups = groups.filter((g) => g.done);
  const videoPending = groups.reduce((s, g) => s + g.pending, 0);
  const totalCommission = groups.reduce((s, g) => s + g.commission, 0);

  const [kocView, setKocView] = useState<string>(KOC_NAMES[0]);

  const activeColumns: TableColumnsType<Group> = [
    { title: "Chiến dịch", dataIndex: "name", key: "name", render: (v) => <span className="font-medium">{v}</span> },
    { title: "Nhãn hàng", dataIndex: "brand", key: "brand", width: 160 },
    {
      title: "Trạng thái tham gia",
      key: "st",
      width: 180,
      render: (_, g) => {
        const s = statusLabel(g);
        return (
          <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${s.color}`}>
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-current" />
            {s.label}
          </span>
        );
      },
    },
    {
      title: "Tiến độ Video",
      key: "vp",
      width: 150,
      render: (_, g) => (g.total > 0 ? `${g.approved}/${g.total} đã duyệt` : "Chưa có video"),
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <div className="flex flex-col gap-6">
        <div>
          <Title level={3} className="!mb-0">
            Dashboard Cổng KOC
          </Title>
          <Text type="secondary">
            {user?.fullName ? `Xin chào ${user.fullName} · ` : ""}Theo dõi công việc của bạn
          </Text>
        </div>

        {usingMock && (
          <Alert
            type="warning"
            showIcon
            message="Đang hiển thị dữ liệu mẫu — chưa kết nối được máy chủ."
          />
        )}

        {jobs.length === 0 && !isLoading ? (
          <Empty description="Bạn chưa có công việc nào" className="py-10" />
        ) : (
          <>
            {/* Tầng 1 · Tổng quan cá nhân */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile label="Chiến dịch đang tham gia" value={activeGroups.length} />
              <StatTile label="Chiến dịch đã hoàn thành" value={historyGroups.length} />
              <StatTile
                label="Video đang chờ xử lý"
                value={videoPending}
                tone="text-amber-500"
                sub="Đang chờ chỉnh sửa / PM duyệt"
              />
              <StatTile
                label="Tổng hoa hồng đã kiếm"
                value={fmtVnd(totalCommission)}
                sub={`Minh hoạ theo ${Math.round(COMMISSION_RATE * 100)}% GMV đóng góp`}
              />
            </div>

            {/* Tầng 2 · Chiến dịch đang tham gia */}
            <PanelCard
              title="Chiến dịch đang tham gia"
              subtitle={`${activeGroups.length} chiến dịch đang tham gia`}
            >
              <Table<Group>
                columns={activeColumns}
                dataSource={activeGroups}
                rowKey="key"
                size="middle"
                pagination={false}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: "Hiện không có chiến dịch nào đang tham gia." }}
              />
            </PanelCard>

            {/* Chi tiết chiến dịch đang tham gia & nộp video — cùng luồng hiển thị với
                "Job & Duyệt Video" ở Vận hành chiến dịch, giới hạn theo job của bạn. */}
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Title level={4} className="!mb-0">
                    Chiến dịch của bạn &amp; nộp video
                  </Title>
                  <Text type="secondary">
                    Mời tham gia → Xác nhận → Nộp video → WeWin duyệt → Brand duyệt. Bấm &quot;Xem chi
                    tiết&quot; ở 1 chiến dịch để xem thông tin và upload video.
                  </Text>
                </div>
                <Select
                  style={{ minWidth: 220 }}
                  value={kocView}
                  onChange={setKocView}
                  options={KOC_NAMES.map((n) => ({ value: n, label: n }))}
                />
              </div>
              <CampaignVideoPanel kocName={kocView} canKocUpload />
            </div>
          </>
        )}
      </div>
    </Spin>
  );
}
