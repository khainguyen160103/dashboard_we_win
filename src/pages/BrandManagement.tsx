import { useState, useMemo } from "react";
import {
  Button,
  Card,
  Flex,
  Input,
  Statistic,
  Tag,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
  TrophyOutlined,
  DollarCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

import {
  BrandTable,
  BrandFormModal,
  BrandDetailDrawer,
  initialMockBrands,
  formatVND,
} from "../features/brand";

import type { Brand, BrandFormValues } from "../features/brand";

export default function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>(initialMockBrands);
  const [searchText, setSearchText] = useState("");

  // Modal / Drawer states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormModalOpen(true);
  };

  const handleOpenDetail = (brand: Brand) => {
    setSelectedBrand(brand);
    setDetailDrawerOpen(true);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setEditingBrand(null);
  };

  const handleSubmitForm = (values: BrandFormValues) => {
    if (editingBrand) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? {
                ...b,
                ...values,
              }
            : b
        )
      );
      message.success(`Đã cập nhật nhãn hàng "${values.name}"!`);
    } else {
      const newBrand: Brand = {
        ...values,
        id: Date.now(),
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalSpent: 0,
        joinDate: new Date().toISOString().split("T")[0],
      };
      setBrands((prev) => [newBrand, ...prev]);
      message.success(`Đã thêm nhãn hàng "${values.name}"!`);
    }
    handleCloseForm();
  };

  const handleDelete = (brandId: number) => {
    const brand = brands.find((b) => b.id === brandId);
    setBrands((prev) => prev.filter((b) => b.id !== brandId));
    message.success(`Đã xóa nhãn hàng "${brand?.name}"!`);
  };

  // ── Filtered brands ───────────────────────────────────────────────────────
  const filteredBrands = useMemo(() => {
    if (!searchText.trim()) return brands;
    const q = searchText.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q) ||
        b.contactName.toLowerCase().includes(q) ||
        b.contactEmail.toLowerCase().includes(q)
    );
  }, [brands, searchText]);

  // ── Summary metrics ───────────────────────────────────────────────────────
  const activeCount = brands.filter((b) => b.status === "Active").length;
  const totalSpent = brands.reduce((sum, b) => sum + b.totalSpent, 0);
  const goldCount = brands.filter((b) => b.tier === "Gold").length;

  return (
    <>
      <PageMeta
        title="Quản lý Brand (Nhãn hàng)"
        description="Quản lý danh sách nhãn hàng, thông tin liên hệ, tier và lịch sử chiến dịch"
      />
      <PageBreadcrumb pageTitle="Quản lý Brand" />

      {/* ─── Summary Cards ─── */}
      <Flex gap={16} style={{ marginBottom: 24 }} wrap="wrap">
        <Card size="small" style={{ flex: 1, minWidth: 160 }}>
          <Statistic
            title="Tổng Nhãn Hàng"
            value={brands.length}
            prefix={<ShopOutlined style={{ color: "#1890ff" }} />}
            valueStyle={{ color: "#1890ff", fontSize: 26 }}
          />
        </Card>
        <Card size="small" style={{ flex: 1, minWidth: 160 }}>
          <Statistic
            title="Đang Hợp Tác"
            value={activeCount}
            prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
            valueStyle={{ color: "#52c41a", fontSize: 26 }}
          />
          <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
            {brands.filter((b) => b.status === "Pending").length} chờ xác nhận
          </div>
        </Card>
        <Card size="small" style={{ flex: 1, minWidth: 160 }}>
          <Statistic
            title="Tier Gold"
            value={goldCount}
            prefix={<StarOutlined style={{ color: "#faad14" }} />}
            valueStyle={{ color: "#faad14", fontSize: 26 }}
            suffix={
              <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                {" / "}{brands.length}
              </span>
            }
          />
        </Card>
        <Card size="small" style={{ flex: 1.3, minWidth: 200 }}>
          <Statistic
            title="Tổng Chi Tiêu (tất cả)"
            value={formatVND(totalSpent)}
            suffix="₫"
            prefix={<DollarCircleOutlined style={{ color: "#722ed1" }} />}
            valueStyle={{ color: "#722ed1", fontSize: 22 }}
          />
        </Card>
      </Flex>

      {/* ─── Tier Distribution Tags ─── */}
      <Flex gap={8} style={{ marginBottom: 20 }} wrap="wrap">
        <span style={{ color: "#8c8c8c", fontSize: 13, alignSelf: "center" }}>Phân bổ tier:</span>
        {(["Gold", "Silver", "Bronze", "New"] as const).map((tier) => {
          const count = brands.filter((b) => b.tier === tier).length;
          const colorMap = { Gold: "#faad14", Silver: "#8c8c8c", Bronze: "#d46b08", New: "#52c41a" };
          return (
            <Tag
              key={tier}
              style={{
                backgroundColor: colorMap[tier],
                color: "#fff",
                borderColor: colorMap[tier],
                fontWeight: 600,
                fontSize: 12,
                padding: "2px 10px",
              }}
            >
              ★ {tier}: {count} brand{count !== 1 ? "s" : ""}
            </Tag>
          );
        })}
      </Flex>

      {/* ─── Toolbar ─── */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }} wrap="wrap" gap={12}>
        <Input
          placeholder="Tìm kiếm theo tên, ngành hàng, người liên hệ..."
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ width: 360 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          + Thêm Nhãn Hàng
        </Button>
      </Flex>

      {/* ─── Table ─── */}
      <BrandTable
        brands={filteredBrands}
        onViewDetail={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* ─── Form Modal ─── */}
      <BrandFormModal
        open={formModalOpen}
        editingBrand={editingBrand}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />

      {/* ─── Detail Drawer ─── */}
      <BrandDetailDrawer
        open={detailDrawerOpen}
        brand={selectedBrand}
        onClose={() => setDetailDrawerOpen(false)}
        onEdit={(brand) => {
          setDetailDrawerOpen(false);
          handleOpenEdit(brand);
        }}
      />
    </>
  );
}
