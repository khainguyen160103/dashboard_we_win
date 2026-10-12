import { useMemo, useState } from "react";
import {
  Avatar,
  Checkbox,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { UserOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { KOCRecord, Platform, Gender } from "../koc/types";
import type { Koc } from "../../model/User";
import { useKoc } from "../../hooks/query/useKocQuery";
import { useAvailableKocsQuery } from "../../hooks/query/useCampaignKocQuery";
import { initialMockCampaigns } from "./campaign.data";
import { getPlatformIcon, getTierColor, formatFollowers } from "../koc/koc.utils";
import { formatVND } from "./campaign.utils";

/** Picker row: a KOCRecord plus the real backend user id (= campaign-koc `kocUserId`). */
export type InviteRow = KOCRecord & { kocUserId: string };

// ─── Real KOC (GET /kocs | /available) → KOCRecord shape used by this picker ───
const KOC_TIERS: KOCRecord["tier"][] = ["Nano", "Micro", "Macro", "Mega"];

/** Stable numeric surrogate id from the backend UUID (the picker keys on numbers). */
const hashKocId = (uuid: string): number => {
  let h = 0;
  for (let i = 0; i < uuid.length; i++) h = (Math.imul(31, h) + uuid.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const mapKocToRecord = (koc: Koc, usedIds: Set<number>): InviteRow => {
  let id = hashKocId(String(koc.id));
  while (usedIds.has(id)) id = (id + 1) | 0;
  usedIds.add(id);

  return {
    id,
    kocUserId: String(koc.id),
    name: koc.name,
    email: koc.email ?? "",
    phone: koc.zalo || undefined,
    zalo: koc.zalo || undefined,
    followers: koc.followers ?? 0,
    gmv: koc.gmv ?? 0,
    engagementRate: koc.engagementRate ?? 0,
    platform: "TikTok",
    totalPosts: 0,
    status: "Active",
    tier: KOC_TIERS.includes(koc.tier as KOCRecord["tier"])
      ? (koc.tier as KOCRecord["tier"])
      : "Nano",
    joinDate: "",
    category: koc.productCategory || undefined,
    city: koc.topLocation || koc.address || undefined,
  };
};

interface InviteKOCModalProps {
  open: boolean;
  alreadyInvitedKocIds: number[];
  onClose: () => void;
  onInvite: (kocsToInvite: { koc: InviteRow; hasCast: boolean }[]) => void;
  /** When set, the pool is scoped to KOCs NOT yet in this campaign (`/campaigns/{id}/kocs/available`). */
  campaignId?: string;
}

export function InviteKOCModal({
  open,
  alreadyInvitedKocIds,
  onClose,
  onInvite,
  campaignId,
}: InviteKOCModalProps) {
  // Filters state
  const [searchText, setSearchText] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "All">("All");
  const [tierFilter, setTierFilter] = useState<string | "All">("All");
  const [minFollowers, setMinFollowers] = useState<number>(0);
  const [minGMV, setMinGMV] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string | "All">("All");
  const [cityFilter, setCityFilter] = useState<string | "All">("All");
  const [genderFilter, setGenderFilter] = useState<Gender | "All">("All");
  const [joinedCampaignFilter, setJoinedCampaignFilter] = useState<number | "All">("All");
  
  // Deduplication & Exclude joined KOC checkbox
  const [excludeJoinedAnyCampaign, setExcludeJoinedAnyCampaign] = useState<boolean>(false);

  // Selected KOCs
  const [selectedKocIds, setSelectedKocIds] = useState<number[]>([]);
  const [hasCastMap, setHasCastMap] = useState<Record<number, boolean>>({});

  // Real KOC pool — campaign-scoped "available" list when campaignId is given,
  // otherwise the full warehouse (GET /kocs). Only fetch while the modal is open.
  const warehouse = useKoc(undefined, { enabled: open && !campaignId });
  const available = useAvailableKocsQuery(campaignId, undefined, {
    enabled: open && Boolean(campaignId),
  });
  const realKocs = (campaignId ? available.data : warehouse.data) ?? [];
  const isLoading = campaignId ? available.isLoading : warehouse.isLoading;

  const kocPool = useMemo<InviteRow[]>(() => {
    const usedIds = new Set<number>();
    return realKocs.map((koc) => mapKocToRecord(koc, usedIds));
  }, [realKocs]);

  // Filter pool based on all criteria
  const filteredKOCs = kocPool.filter((koc) => {
    // 1. Exclude already invited KOCs in current modal session
    if (alreadyInvitedKocIds.includes(koc.id)) return false;

    // 2. Filter do not duplicate KOC joined campaign rule
    if (excludeJoinedAnyCampaign && koc.joinedCampaignIds && koc.joinedCampaignIds.length > 0) {
      return false;
    }

    // 3. Keyword Search (name, email)
    if (
      searchText &&
      !koc.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !koc.email.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }

    // 4. Platform Filter
    if (platformFilter !== "All" && koc.platform !== platformFilter) return false;

    // 5. Tier Filter
    if (tierFilter !== "All" && koc.tier !== tierFilter) return false;

    // 6. Followers Min Filter
    if (minFollowers > 0 && koc.followers < minFollowers) return false;

    // 7. GMV Min Filter
    if (minGMV > 0 && (koc.gmv || 0) < minGMV) return false;

    // 8. Category / Đặc điểm kênh Filter
    if (categoryFilter !== "All" && koc.category !== categoryFilter) return false;

    // 9. City / Address Filter
    if (cityFilter !== "All" && koc.city !== cityFilter) return false;

    // 10. Gender Filter
    if (genderFilter !== "All" && koc.gender !== genderFilter) return false;

    // 11. Joined Campaign Filter
    if (joinedCampaignFilter !== "All") {
      if (!koc.joinedCampaignIds || !koc.joinedCampaignIds.includes(joinedCampaignFilter as number)) {
        return false;
      }
    }

    return true;
  });

  const handleToggleHasCast = (kocId: number, checked: boolean) => {
    setHasCastMap((prev) => ({ ...prev, [kocId]: checked }));
  };

  const handleOk = () => {
    const toInvite = selectedKocIds.map((id) => {
      const koc = kocPool.find((k) => k.id === id)!;
      return {
        koc,
        hasCast: !!hasCastMap[id],
      };
    });
    onInvite(toInvite);
    setSelectedKocIds([]);
    setHasCastMap({});
    onClose();
  };

  const columns: TableColumnsType<InviteRow> = [
    {
      title: "KOC",
      key: "name",
      render: (_, record) => (
        <Flex align="center" gap={10}>
          <Avatar icon={<UserOutlined />} size={32} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {record.name} {record.gender && <Tag style={{ fontSize: 10 }}>{record.gender}</Tag>}
            </div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>{record.email}</div>
          </div>
        </Flex>
      ),
    },
    {
      title: "Nền tảng / Tier",
      key: "platform",
      width: 140,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            {getPlatformIcon(record.platform)}
            <span style={{ fontSize: 12 }}>{record.platform}</span>
          </Space>
          <Tag color={getTierColor(record.tier)} style={{ margin: 0, fontSize: 10 }}>
            {record.tier} ({formatFollowers(record.followers)})
          </Tag>
        </Space>
      ),
    },
    {
      title: "Đặc điểm kênh & Địa chỉ",
      key: "niche",
      width: 160,
      render: (_, record) => (
        <div>
          {record.category && <Tag color="blue">{record.category}</Tag>}
          <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>
            📍 {record.city || "Chưa cập nhật"}
          </div>
        </div>
      ),
    },
    {
      title: "Doanh số GMV",
      key: "gmv",
      width: 130,
      align: "right",
      render: (_, record) => (
        <Tooltip title="Tổng doanh số bán hàng qua kênh KOC">
          <strong style={{ color: "#52c41a", fontSize: 12 }}>
            {record.gmv ? formatVND(record.gmv) : "0 ₫"}
          </strong>
        </Tooltip>
      ),
    },
    {
      title: "Chiến dịch đã tham gia",
      key: "joinedCampaigns",
      width: 150,
      render: (_, record) => {
        const count = record.joinedCampaignIds?.length || 0;
        return count > 0 ? (
          <Tag color="purple">{count} Chiến dịch</Tag>
        ) : (
          <Tag color="default">Chưa tham gia</Tag>
        );
      },
    },
    {
      title: "Có Cast?",
      key: "hasCast",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Checkbox
          checked={!!hasCastMap[record.id]}
          onChange={(e) => handleToggleHasCast(record.id, e.target.checked)}
        >
          Có cast
        </Checkbox>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FilterOutlined style={{ color: "#1890ff" }} />
          <span>Bộ lọc &amp; Mời KOC tham gia chiến dịch</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={`Mời ${selectedKocIds.length} KOC đã chọn`}
      okButtonProps={{ disabled: selectedKocIds.length === 0 }}
      cancelText="Hủy"
      width={960}
      destroyOnClose
    >
      {/* ── Filter Controls Toolbar ── */}
      <div style={{ backgroundColor: "#fafafa", padding: 12, borderRadius: 8, marginBottom: 16 }}>
        {/* Row 1: Search, Platform, Tier, Category, Gender */}
        <Flex gap={10} wrap="wrap" style={{ marginBottom: 10 }}>
          <Input
            placeholder="Tìm theo tên, email KOC..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            value={platformFilter}
            onChange={setPlatformFilter}
            style={{ width: 120 }}
            options={[
              { value: "All", label: "Nền tảng: Tất cả" },
              { value: "TikTok", label: "TikTok" },
              { value: "Instagram", label: "Instagram" },
              { value: "YouTube", label: "YouTube" },
            ]}
          />
          <Select
            value={tierFilter}
            onChange={setTierFilter}
            style={{ width: 110 }}
            options={[
              { value: "All", label: "Tier: Tất cả" },
              { value: "Nano", label: "Nano" },
              { value: "Micro", label: "Micro" },
              { value: "Macro", label: "Macro" },
              { value: "Mega", label: "Mega" },
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            options={[
              { value: "All", label: "Đặc điểm: Tất cả" },
              { value: "Beauty", label: "Beauty" },
              { value: "Fashion", label: "Fashion" },
              { value: "Tech", label: "Tech" },
              { value: "F&B", label: "F&B" },
              { value: "Travel", label: "Travel" },
              { value: "Lifestyle", label: "Lifestyle" },
            ]}
          />
          <Select
            value={genderFilter}
            onChange={setGenderFilter}
            style={{ width: 110 }}
            options={[
              { value: "All", label: "Giới tính: All" },
              { value: "Nam", label: "Nam" },
              { value: "Nữ", label: "Nữ" },
            ]}
          />
        </Flex>

        {/* Row 2: Followers, GMV, Address, Campaign Joined, Deduplication */}
        <Flex gap={10} wrap="wrap" align="center">
          <Select
            value={minFollowers}
            onChange={setMinFollowers}
            style={{ width: 160 }}
            options={[
              { value: 0, label: "Followers: Tất cả" },
              { value: 50000, label: "> 50,000 follow" },
              { value: 200000, label: "> 200,000 follow" },
              { value: 1000000, label: "> 1,000,000 follow" },
            ]}
          />
          <Select
            value={minGMV}
            onChange={setMinGMV}
            style={{ width: 170 }}
            options={[
              { value: 0, label: "Doanh số GMV: Tất cả" },
              { value: 50000000, label: "GMV > 50 Tr ₫" },
              { value: 150000000, label: "GMV > 150 Tr ₫" },
              { value: 500000000, label: "GMV > 500 Tr ₫" },
            ]}
          />
          <Select
            value={cityFilter}
            onChange={setCityFilter}
            style={{ width: 150 }}
            options={[
              { value: "All", label: "Địa chỉ: Tất cả" },
              { value: "Hà Nội", label: "Hà Nội" },
              { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
              { value: "Đà Nẵng", label: "Đà Nẵng" },
              { value: "Cần Thơ", label: "Cần Thơ" },
            ]}
          />
          <Select
            value={joinedCampaignFilter}
            onChange={setJoinedCampaignFilter}
            style={{ width: 190 }}
            options={[
              { value: "All", label: "Chiến dịch đã tham gia: Tất cả" },
              ...initialMockCampaigns.map((c) => ({
                value: c.id,
                label: `Đã tham gia: ${c.name}`,
              })),
            ]}
          />

          {/* Filter Do Not Duplicate KOC Joined Campaign Checkbox */}
          <Checkbox
            checked={excludeJoinedAnyCampaign}
            onChange={(e) => setExcludeJoinedAnyCampaign(e.target.checked)}
            style={{ fontSize: 12, fontWeight: 600, color: "#d4b106" }}
          >
            🚫 Lọc loại trừ KOC đã tham gia chiến dịch (Tránh trùng lặp)
          </Checkbox>
        </Flex>
      </div>

      {/* Table of Filtered KOCs */}
      <Table<InviteRow>
        rowSelection={{
          selectedRowKeys: selectedKocIds,
          onChange: (keys) => setSelectedKocIds(keys as number[]),
        }}
        columns={columns}
        dataSource={filteredKOCs}
        loading={isLoading}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5, showTotal: (t) => `Tìm thấy ${t} KOC phù hợp` }}
        bordered
      />
    </Modal>
  );
}
