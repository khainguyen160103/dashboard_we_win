import Table from 'antd/es/table';
import { Koc } from '../../model/User';
import type { ColumnType, TableProps } from 'antd/es/table';
import { useMemo, useState } from 'react';
import {  Button, Checkbox, Flex, Input, InputNumber, Modal, Select, Space, Upload, Divider, Typography, message } from 'antd';
import {
    FileExcelOutlined,
    CheckCircleTwoTone
} from "@ant-design/icons";
import { useQueryClient } from '@tanstack/react-query';
import { useModal } from '../../hooks/useModal';
import { KOCFormModal } from '../koc/KOCFormModal';
import { useKocs } from '../../hooks/query/useKocQuery';
import { useCampaigns } from '../../hooks/query/useCampaignQuery';
import { queryKeys } from '../../hooks/query/queryKeys';
import { mapKocToRequest } from '../../model/Koc';
import campaignKocService from '../../services/campaignKoc.service';

// Dữ liệu KOC được lấy từ API (GET /kocs) thông qua hook useKocs — xem bên dưới.

const TIER_OPTIONS = [
    { value: 'Nano', label: 'Nano' },
    { value: 'Micro', label: 'Micro' },
    { value: 'Macro', label: 'Macro' },
    { value: 'Mega', label: 'Mega' },
];

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Ngừng hoạt động' },
];

const { Title } = Typography;

const fmt = (value?: string | number | null) =>
    typeof value === 'number' ? value.toLocaleString('vi-VN') : (value ?? '');


export default function KocTable() {

    const allColumns: ColumnType<Koc>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên nhà sáng tạo',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'ID TikTok',
            dataIndex: 'idTiktok',
            key: 'idTiktok',
        },
        {
            title: 'Link TikTok',
            dataIndex: 'linkTiktok',
            key: 'linkTiktok',
        },
        {
            title: 'Facebook',
            dataIndex: 'facebook',
            key: 'facebook',
        },
        {
            title: 'Zalo',
            dataIndex: 'zalo',
            key: 'zalo',
        },
        {
            title: 'Loại KOC',
            dataIndex: 'kocType',
            key: 'kocType',
        },
        {
            title: 'Tier',
            dataIndex: 'tier',
            key: 'tier',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'GMV',
            dataIndex: 'gmv',
            key: 'gmv',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
        },
        {
            title: 'Followers',
            dataIndex: 'followers',
            key: 'followers',
        },
        {
            title: 'Lượt xem',
            dataIndex: 'viewer',
            key: 'viewer',
        },
        {
            title: 'Tỷ lệ tương tác',
            dataIndex: 'engagementRate',
            key: 'engagementRate',
        },
        {
            title: 'Giá bán trung bình',
            dataIndex: 'averageSellingPrice',
            key: 'averageSellingPrice',
        },
        {
            title: 'Doanh số Livestream',
            dataIndex: 'livestreamTotalAmount',
            key: 'livestreamTotalAmount',
        },
        {
            title: 'Doanh số Video',
            dataIndex: 'videoTotalAmount',
            key: 'videoTotalAmount',
        },
        {
            title: 'GMV / Khách hàng',
            dataIndex: 'gmvPerCustomer',
            key: 'gmvPerCustomer',
        },
        {
            title: 'GMV theo sản phẩm',
            dataIndex: 'gmvByProduct',
            key: 'gmvByProduct',
        },
        {
            title: 'GMV theo kênh bán',
            dataIndex: 'gmvPerSaleChanel',
            key: 'gmvPerSaleChanel',
        },
        {
            title: 'Follower Nữ (%)',
            dataIndex: 'followerFemale',
            key: 'followerFemale',
        },
        {
            title: 'Follower Nam (%)',
            dataIndex: 'followerMale',
            key: 'followerMale',
        },
        {
            title: 'Độ tuổi Follower',
            dataIndex: 'followerAge',
            key: 'followerAge',
        },
        {
            title: 'Khu vực hàng đầu',
            dataIndex: 'topLocation',
            key: 'topLocation',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Độ tuổi con',
            dataIndex: 'ageOfChildren',
            key: 'ageOfChildren',
        },
        {
            title: 'Số tài khoản ngân hàng',
            dataIndex: 'bankAccount',
            key: 'bankAccount',
        },
        {
            title: 'Loại ngân hàng',
            dataIndex: 'typeBank',
            key: 'typeBank',
        },
        {
            title: 'Chi tiết',
            key: 'x',
            render: (_, record) => <Button type="primary" onClick={() => handleUserDetailOpenModal(record)}>Chi tiết</Button>,
        },
          {
            title: 'Chiến dịch',
            key: 'y',
            render: (_, record) => <Button type="primary" onClick={() => handleCampaignOpenModal(record)}>Thêm</Button>,
        }
    ];

    // Bộ cột hiển thị mặc định khi mở trang (người dùng bật thêm qua modal "+ Columns").
    const DEFAULT_VISIBLE_KEYS = ['name', 'tier', 'gmv', 'followers', 'status', 'address', 'x', 'y'];


    const handleUserDetailOpenModal =  (user: Koc) => { 
        setSelectedUser(user);
        openUserDetailModal();
        console.log("User detail modal opened for user:", user);
    }


    const handleCampaignOpenModal = (user: Koc) => {
        setCampaignKocs([user]);
        setCampaignId(undefined);
        openCampaignModal();
    }

    const handleAddSelectedToCampaign = () => {
        setCampaignKocs(selectedRowKeys.map((key) => dataSource.find((user) => user.id === key)!).filter(Boolean) as Koc[]);
        setCampaignId(undefined);
        openCampaignModal();
    }

    const handleOpenAddKoc = () => {
        setEditingKoc(null);
        openAddKocModal();
    };

    const handleCloseKocForm = () => {
        closeAddKocModal();
        setEditingKoc(null);
    };

    const handleKocFormSubmit = async (values: Koc) => {
        try {
            if (editingKoc) {
                await updateKoc({ id: editingKoc.id, payload: mapKocToRequest(values) });
                message.success('Cập nhật KOC thành công');
            } else {
                await createKoc(mapKocToRequest(values));
                message.success('Thêm KOC thành công');
            }
            handleCloseKocForm();
        } catch (err: any) {
            message.error(
                err?.response?.data?.message ?? 'Lưu KOC thất bại, vui lòng thử lại',
            );
            throw err; // giữ modal mở
        }
    };

    const queryClient = useQueryClient();

    const [checkedList, setCheckedList] = useState(DEFAULT_VISIBLE_KEYS);
    const [selectedUser, setSelectedUser] = useState<Koc | null>(null);
    const [editingKoc, setEditingKoc] = useState<Koc | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [campaignKocs, setCampaignKocs] = useState<Koc[]>([]);
    const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
    const [isInviting, setIsInviting] = useState(false);

    // Thêm các KOC đang chọn vào chiến dịch đã chọn (POST /campaigns/{id}/kocs)
    const handleAddKocsToCampaign = async () => {
        if (!campaignId || campaignKocs.length === 0) return;
        try {
            setIsInviting(true);
            const res = await campaignKocService.invite(campaignId, {
                kocUserIds: campaignKocs.map((k) => String(k.id)),
            });
            // Làm mới danh sách KOC của chiến dịch đó ở trang Campaign Management
            void queryClient.invalidateQueries({
                queryKey: queryKeys.campaignKocs.forCampaign(campaignId),
            });
            message.success(
                `Đã thêm ${res.length || campaignKocs.length} KOC vào chiến dịch`,
            );
            closeCampaignModal();
            setSelectedRowKeys([]);
            setCampaignKocs([]);
            setCampaignId(undefined);
        } catch (err: any) {
            message.error(
                err?.response?.data?.message ?? 'Không thêm được KOC vào chiến dịch',
            );
        } finally {
            setIsInviting(false);
        }
    };


    const { kocs: dataSource, isLoading, isError, createKoc, updateKoc, isCreating, isUpdating } = useKocs();


    const { data: campaigns, isLoading: isCampaignsLoading } = useCampaigns();
    // `useCampaigns` trả về nguyên response (`{ data: { content: [...] } }`), không phải mảng
    const campaignList: any[] = Array.isArray(campaigns)
        ? campaigns
        : (campaigns as any)?.data?.content ??
        (campaigns as any)?.content ??
        (campaigns as any)?.data ??
        [];
    const campaignOptions = campaignList.map((c: any) => ({
        value: String(c.id ?? c.campaignId ?? c.code),
        label: c.name ?? c.title ?? String(c.id),
    }));


    const [tierFilter, setTierFilter] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
    const [gmvMin, setGmvMin] = useState<number | undefined>(undefined);
    const [followersMin, setFollowersMin] = useState<number | undefined>(undefined);
    const [revenueMin, setRevenueMin] = useState<number | undefined>(undefined);

    // Danh sách ngành hàng lấy từ chính dữ liệu KOC hiện có (luôn khớp dữ liệu thật).
    const categoryOptions = useMemo(() => {
        const values = new Set(
            dataSource.map((koc) => koc.productCategory).filter((v): v is string => Boolean(v)),
        );
        return [...values].map((v) => ({ value: v, label: v }));
    }, [dataSource]);

    const filteredData = dataSource.filter(
        (koc) =>
            (!tierFilter || koc.tier === tierFilter) &&
            (!statusFilter || koc.status === statusFilter) &&
            (!categoryFilter || koc.productCategory === categoryFilter) &&
            (gmvMin === undefined || Number(koc.gmv) >= gmvMin) &&
            (followersMin === undefined || Number(koc.followers) >= followersMin) &&
            (revenueMin === undefined || Number(koc.revenue) >= revenueMin),
    );

    const hasActiveFilter = Boolean(
        tierFilter ||
        statusFilter ||
        categoryFilter ||
        gmvMin !== undefined ||
        followersMin !== undefined ||
        revenueMin !== undefined,
    );
    const clearFilters = () => {
        setTierFilter(undefined);
        setStatusFilter(undefined);
        setCategoryFilter(undefined);
        setGmvMin(undefined);
        setFollowersMin(undefined);
        setRevenueMin(undefined);
    };

    const rowSelection: TableProps<Koc>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: Koc[]) => {
            setSelectedRowKeys(selectedRowKeys as string[]);
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
    };

    const { isOpen: isColumnsModalOpen, openModal: openColumnsModal, closeModal: closeColumnsModal } = useModal(false);
    const { isOpen: isUserDetailOpen, openModal: openUserDetailModal, closeModal: closeUserDetailModal } = useModal(false);
    const { isOpen: isCampaignModalOpen, openModal: openCampaignModal, closeModal: closeCampaignModal } = useModal(false);
    const { isOpen: isOpenAddKoc, openModal: openAddKocModal, closeModal: closeAddKocModal } = useModal(false);

    const newColumns = allColumns.map((item) => ({
        ...item,
        hidden: !checkedList.includes(item.key as string),
    }))


    return (<>
        <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
            <Space size={10}>
                <Button
                    type="primary"
                    disabled={selectedRowKeys.length === 0}
                    onClick={handleAddSelectedToCampaign}
                >
                    Thêm vào chiến dịch ({selectedRowKeys.length})
                </Button>
                <Upload>
                    <Button icon={<FileExcelOutlined style={{ color: "#52c41a" }} />}>Import Excel</Button>
                </Upload>
              
                    <Button
                        type="primary"
                        onClick={handleOpenAddKoc}
                    >
                        + Thêm KOC
                    </Button>
            
                    <Button onClick={openColumnsModal} type="primary">+ Columns</Button>

            </Space>
        </Flex>

        <Space size={12} style={{ marginBottom: 16 }} wrap>
            <Select
                allowClear
                placeholder="Lọc theo Tier"
                style={{ width: 180 }}
                value={tierFilter}
                onChange={(v) => setTierFilter(v)}
                options={TIER_OPTIONS}
            />
            <Select
                allowClear
                placeholder="Lọc theo trạng thái"
                style={{ width: 200 }}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                options={STATUS_OPTIONS}
            />
            <Select
                allowClear
                placeholder="Lọc theo ngành hàng"
                style={{ width: 200 }}
                value={categoryFilter}
                onChange={(v) => setCategoryFilter(v)}
                options={categoryOptions}
            />

            <InputNumber
                placeholder="GMV tối thiểu"
                style={{ width: 180 }}
                min={0}
                value={gmvMin}
                onChange={(v) => setGmvMin(v ?? undefined)}
            />

            <InputNumber
                placeholder="Follower tối thiểu"
                style={{ width: 180 }}
                min={0}
                value={followersMin}
                onChange={(v) => setFollowersMin(v ?? undefined)}
            />

            <InputNumber
                placeholder="Doanh thu tối thiểu"
                style={{ width: 180 }}
                min={0}
                value={revenueMin}
                onChange={(v) => setRevenueMin(v ?? undefined)}
            />

            {hasActiveFilter && (
                <Button type="link" onClick={clearFilters}>
                    Xóa bộ lọc
                </Button>
            )}
        </Space>

        {isError && (
            <div className="mb-3 text-sm text-red-500">
                Không tải được danh sách KOC. Vui lòng thử lại.
            </div>
        )}

        <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table
                dataSource={filteredData}
                columns={newColumns}
                rowKey="id"
                rowSelection={{...rowSelection }}
                loading={isLoading}
                bordered
                sticky
                scroll={{ x: 'max-content' }}
            />
        </div>
        
        <Modal
            title="Thêm cột hiển thị"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isColumnsModalOpen}
            onOk={closeColumnsModal}
            onCancel={closeColumnsModal}
        >
            <div>

                <Checkbox.Group value={checkedList} onChange={(v) => setCheckedList(v as string[])}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {allColumns.map((c) => (
                            <Checkbox key={c.key as string} value={c.key}>{c.title as React.ReactNode}</Checkbox>
                        ))}
                    </div>
                </Checkbox.Group>


            </div>
        </Modal>

        <Modal
            title={<Title level={4}>Thông tin KOC</Title>}
            centered
            open={isUserDetailOpen}
            onOk={closeUserDetailModal}
            onCancel={closeUserDetailModal}
            width={{
                xs: '90%',
                sm: '80%',
                md: '70%',
                lg: '60%',
                xl: '50%',
                xxl: '40%',
            }}
        >
            {
                selectedUser && (

                    <div key={selectedUser.id}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p>{selectedUser.name}</p>
                                <div className="flex gap-4">
                                    <span>Tier: {selectedUser.tier}</span> -
                                    <span>Product Category: {selectedUser.productCategory}</span> -
                                    <span>Followers: {fmt(selectedUser.followers)}</span>
                                </div>
                            </div>
                            <div>
                                <CheckCircleTwoTone />  {selectedUser.status}
                            </div>
                        </div>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Thông tin cơ bản</Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Tên nhà sáng tạo
                                    </label>
                                    <Input defaultValue={selectedUser.name} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Tier
                                    </label>
                                    <Input defaultValue={selectedUser.tier} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Tài khoản NST (Id Tiktok)
                                    </label>
                                    <Input defaultValue={selectedUser.idTiktok} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Lượng người theo dõi
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.followers)} />
                                </div>
                            </div>
                        </Space>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Hiệu suất bán hàng</Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Doanh số
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.gmv)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Giá bán trung bình
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.averageSellingPrice)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Tỷ lệ tương tác
                                    </label>
                                    <Input defaultValue={`${selectedUser.engagementRate}%`} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Doanh số livestream
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.livestreamTotalAmount)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Doanh số video
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.videoTotalAmount)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Lượt xem
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.viewer)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        GMV per customer
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.gmvPerCustomer)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        GMV by product category
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.gmvByProduct)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        GMV per sales channel
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.gmvPerSaleChanel)} />
                                </div>
                            </div>
                        </Space>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Liên Hệ</Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Link TikTok
                                    </label>
                                    <Input defaultValue={selectedUser.linkTiktok} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Facebook
                                    </label>
                                    <Input defaultValue={selectedUser.facebook} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Zalo / Số điện thoại
                                    </label>
                                    <Input defaultValue={selectedUser.zalo} />
                                </div>
                            </div>
                        </Space>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Nhân khẩu học người theo dõi</Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Giới tính follower
                                    </label>
                                    <Input defaultValue={`Nữ ${selectedUser.followerFemale}% / Nam ${selectedUser.followerMale}%`} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Độ tuổi của follower
                                    </label>
                                    <Input defaultValue={fmt(selectedUser.followerAge)} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Khu vực hàng đầu
                                    </label>
                                    <Input defaultValue={selectedUser.topLocation} />
                                </div>
                            </div>
                        </Space>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Thông tin cá nhân & vận chuyển</Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Họ tên đầy đủ
                                    </label>
                                    <Input defaultValue={selectedUser.name} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Địa chỉ nhận hàng
                                    </label>
                                    <Input defaultValue={selectedUser.address} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Số tài khoản ngân hàng nhận cast
                                    </label>
                                    <Input defaultValue={selectedUser.bankAccount} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Loại ngân hàng
                                    </label>
                                    <Input defaultValue={selectedUser.typeBank} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Độ tuổi của con
                                    </label>
                                    <Input defaultValue={selectedUser.ageOfChildren} />
                                </div>
                            </div>
                        </Space>
                    </div>
                )
            }
        </Modal>


        <Modal
            title="Thêm vào chiến dịch"
            centered
            open={isCampaignModalOpen}
            okText="Thêm vào chiến dịch"
            cancelText="Hủy"
            okButtonProps={{ disabled: !campaignId || campaignKocs.length === 0 }}
            confirmLoading={isInviting}
            onOk={handleAddKocsToCampaign}
            onCancel={closeCampaignModal}
            width={{
                xs: '90%',
                sm: '80%',
                md: '70%',
                lg: '60%',
                xl: '50%',
                xxl: '40%',
            }}
        >
            <div style={{ marginBottom: 16 }}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Chọn chiến dịch
                </label>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn chiến dịch để thêm KOC vào"
                    value={campaignId}
                    onChange={setCampaignId}
                    options={campaignOptions}
                    loading={isCampaignsLoading}
                    notFoundContent={isCampaignsLoading ? 'Đang tải...' : 'Không có chiến dịch'}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                />
            </div>

            {campaignKocs.length === 0 ? (
                <p>Chưa chọn KOC nào.</p>
            ) : (
                <>
                    <p>
                        Đã chọn <strong>{campaignKocs.length}</strong> KOC để thêm vào chiến dịch:
                    </p>
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                        {campaignKocs.map((k) => (
                            <li key={k.id}>
                                {k.name} — {k.kocType} ({k.tier}) · {fmt(k.followers)} followers
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </Modal>

        <KOCFormModal
            open={isOpenAddKoc}
            koc={editingKoc}
            loading={isCreating || isUpdating}
            onClose={handleCloseKocForm}
            onSubmit={handleKocFormSubmit}
        />
        
    </>
        );
         
}
