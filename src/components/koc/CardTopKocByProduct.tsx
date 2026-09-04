import { useMemo, useState } from 'react';
import { Button, Card, Descriptions, Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Koc } from '../../model/User';

const { Title, Text } = Typography;

const compactVND = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
    if (v >= 1e6) return `${Math.round(v / 1e6)} tr`;
    return v.toLocaleString('vi-VN');
};

// Dữ liệu mẫu để component render độc lập khi không truyền prop
const SAMPLE: Koc[] = [
    { name: 'Hoàng Thu Trang', productCategory: 'Mỹ phẩm & Chăm sóc da', revenue: 6_200_000_000, gmv: 6_200_000_000, tier: 'Mega', followers: 1_320_000 },
    { name: 'Hồ Thị Kim Ngân', productCategory: 'Mỹ phẩm & Chăm sóc da', revenue: 1_330_000_000, gmv: 1_330_000_000, tier: 'Micro', followers: 174_000 },
    { name: 'Nguyễn Thị Hương', productCategory: 'Mỹ phẩm & Chăm sóc da', revenue: 1_250_000_000, gmv: 1_250_000_000, tier: 'Micro', followers: 185_000 },
    { name: 'Cao Minh Khôi', productCategory: 'Thiết bị điện tử & Công nghệ', revenue: 4_050_000_000, gmv: 4_050_000_000, tier: 'Macro', followers: 690_000 },
    { name: 'Trần Văn Minh', productCategory: 'Thiết bị điện tử & Công nghệ', revenue: 3_480_000_000, gmv: 3_480_000_000, tier: 'Macro', followers: 620_000 },
    { name: 'Dương Khánh Vy', productCategory: 'Quần áo & Phụ kiện thời trang', revenue: 3_100_000_000, gmv: 3_100_000_000, tier: 'Macro', followers: 512_000 },
    { name: 'Lê Thảo Nhi', productCategory: 'Quần áo & Phụ kiện thời trang', revenue: 940_000_000, gmv: 940_000_000, tier: 'Micro', followers: 128_000 },
    { name: 'Đặng Thu Hà', productCategory: 'Đồ dùng mẹ & bé', revenue: 2_880_000_000, gmv: 2_880_000_000, tier: 'Macro', followers: 556_000 },
    { name: 'Đặng Mỹ Linh', productCategory: 'Đồ dùng mẹ & bé', revenue: 2_760_000_000, gmv: 2_760_000_000, tier: 'Macro', followers: 540_000 },
    { name: 'Bùi Anh Tuấn', productCategory: 'Dụng cụ thể thao & Gym', revenue: 2_950_000_000, gmv: 2_950_000_000, tier: 'Macro', followers: 480_000 },
    { name: 'Võ Nhật Nam', productCategory: 'Dụng cụ thể thao & Gym', revenue: 1_040_000_000, gmv: 1_040_000_000, tier: 'Micro', followers: 139_000 },
    { name: 'Nguyễn Hoàng Sơn', productCategory: 'Thực phẩm & Đồ uống', revenue: 720_000_000, gmv: 720_000_000, tier: 'Micro', followers: 118_000 },
    { name: 'Phạm Quốc Anh', productCategory: 'Thực phẩm & Đồ uống', revenue: 320_000_000, gmv: 320_000_000, tier: 'Nano', followers: 46_000 },
] as Koc[];

type Row = { category: string; koc: Koc };

type Props = {
    kocs?: Koc[];
};

export default function CardTopKocByProduct({ kocs }: Props) {
    const rows = kocs && kocs.length > 0 ? kocs : SAMPLE;

    // Với mỗi danh mục sản phẩm, tìm KOC có doanh thu cao nhất
    const data = useMemo<Row[]>(() => {
        const map = new Map<string, Koc>();
        for (const koc of rows) {
            const key = koc.productCategory || 'Khác';
            const current = map.get(key);
            if (!current || (koc.revenue || 0) > (current.revenue || 0)) {
                map.set(key, koc);
            }
        }
        return [...map.entries()]
            .map(([category, koc]) => ({ category, koc }))
            .sort((a, b) => (b.koc.revenue || 0) - (a.koc.revenue || 0));
    }, [rows]);

    const [selected, setSelected] = useState<Row | null>(null);

    const columns: ColumnsType<Row> = [
        {
            title: 'Danh mục sản phẩm',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Chi tiết',
            key: 'action',
            align: 'right',
            width: 120,
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
                Top KOC theo danh mục sản phẩm
            </Title>
            <Text type="secondary">
                Nhấn "Chi tiết" để xem KOC có doanh thu cao nhất của danh mục
            </Text>

            <Table<Row>
                style={{ marginTop: 12 }}
                size="small"
                rowKey="category"
                columns={columns}
                dataSource={data}
                pagination={false}
            />

            <Modal
                title="KOC doanh thu cao nhất"
                open={selected !== null}
                onCancel={() => setSelected(null)}
                onOk={() => setSelected(null)}
                okText="Đóng"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Danh mục sản phẩm">
                            {selected.category}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên KOC">
                            {selected.koc.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tier">
                            <Tag color="blue">{selected.koc.tier}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Doanh thu">
                            {compactVND(selected.koc.revenue || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="GMV">
                            {compactVND(selected.koc.gmv || 0)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Followers">
                            {(selected.koc.followers || 0).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </Card>
    );
}
