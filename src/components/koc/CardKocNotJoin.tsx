import { useMemo, useState } from 'react';
import { Button, Card, Descriptions, Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Koc } from '../../model/User';

const { Title, Text } = Typography;

// Trạng thái được coi là "chưa từng hợp tác"
const NOT_JOINED_STATUS = 'Tiềm năng';

const fmtNumber = (v?: number) => (v || 0).toLocaleString('vi-VN');

// Dữ liệu mẫu để component render độc lập khi không truyền prop
const SAMPLE: Koc[] = [
    { name: 'Lê Thảo Nhi', idTiktok: '@thaonhi.fashion', kocType: 'Thời trang', productCategory: 'Quần áo & Phụ kiện thời trang', tier: 'Micro', status: 'Tiềm năng', followers: 128_000 },
    { name: 'Ngô Đức Thắng', idTiktok: '@thangngo.gadget', kocType: 'Công nghệ', productCategory: 'Phụ kiện điện thoại & Máy tính', tier: 'Micro', status: 'Tiềm năng', followers: 98_000 },
    { name: 'Trịnh Thùy Dương', idTiktok: '@thuyduong.beauty', kocType: 'Làm đẹp', productCategory: 'Mỹ phẩm trang điểm', tier: 'Nano', status: 'Tiềm năng', followers: 38_000 },
    { name: 'Đinh Phương Thảo', idTiktok: '@phuongthao.health', kocType: 'Sức khỏe', productCategory: 'Thực phẩm chức năng', tier: 'Micro', status: 'Tiềm năng', followers: 156_000 },
    { name: 'Châu Gia Hân', idTiktok: '@giahan.fashion', kocType: 'Thời trang', productCategory: 'Quần áo & Phụ kiện thời trang', tier: 'Micro', status: 'Tiềm năng', followers: 121_000 },
    { name: 'Trần Văn Minh', idTiktok: '@minhtran.tech', kocType: 'Công nghệ', productCategory: 'Thiết bị điện tử & Công nghệ', tier: 'Macro', status: 'Đang hợp tác', followers: 620_000 },
] as Koc[];

type Props = {
    kocs?: Koc[];
};

export default function CardKocNotJoin({ kocs }: Props) {
    const rows = kocs && kocs.length > 0 ? kocs : SAMPLE;

    const notJoined = useMemo(
        () =>
            rows
                .filter((k) => (k.status || '') === NOT_JOINED_STATUS)
                .sort((a, b) => (b.followers || 0) - (a.followers || 0)),
        [rows],
    );

    const [selected, setSelected] = useState<Koc | null>(null);

    const columns: ColumnsType<Koc> = [
        { title: 'Tên KOC', dataIndex: 'name', key: 'name' },
        {
            title: 'Tier',
            dataIndex: 'tier',
            key: 'tier',
            render: (tier: string) => <Tag color="blue">{tier}</Tag>,
        },
        { title: 'Loại KOC', dataIndex: 'kocType', key: 'kocType' },
        {
            title: 'Followers',
            dataIndex: 'followers',
            key: 'followers',
            align: 'right',
            render: fmtNumber,
        },
        {
            title: 'Chi tiết',
            key: 'action',
            align: 'right',
            width: 110,
            render: (_, row) => (
                <Button type="primary" size="small" onClick={() => setSelected(row)}>
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <Card style={{ borderRadius: 8 }}>
            <Title level={5} style={{ marginTop: 0 }}>
                KOC chưa từng hợp tác (cơ hội mới)
            </Title>
            <Text type="secondary">Danh sách KOC tiềm năng chưa tham gia chiến dịch nào</Text>

            <div style={{ margin: '8px 0 12px' }}>
                <Text style={{ fontSize: 28, fontWeight: 700 }}>{notJoined.length}</Text>{' '}
                <Text type="secondary">KOC</Text>
            </div>

            <Table<Koc>
                size="small"
                rowKey="name"
                columns={columns}
                dataSource={notJoined}
                pagination={false}
            />

            <Modal
                title="Thông tin KOC"
                open={selected !== null}
                onCancel={() => setSelected(null)}
                onOk={() => setSelected(null)}
                okText="Đóng"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Tên KOC">{selected.name}</Descriptions.Item>
                        <Descriptions.Item label="ID TikTok">{selected.idTiktok}</Descriptions.Item>
                        <Descriptions.Item label="Loại KOC">{selected.kocType}</Descriptions.Item>
                        <Descriptions.Item label="Danh mục sản phẩm">
                            {selected.productCategory}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tier">
                            <Tag color="blue">{selected.tier}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color="orange">{selected.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Followers">
                            {fmtNumber(selected.followers)}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </Card>
    );
}
