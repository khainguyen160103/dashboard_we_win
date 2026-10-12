import { useMemo, useState } from 'react';
import { Button, Card, Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Koc } from '../../model/User';

const { Title, Text } = Typography;

const compactVND = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
    if (v >= 1e6) return `${Math.round(v / 1e6)} tr`;
    return v.toLocaleString('vi-VN');
};

type Row = {
    category: string;
    kocs: Koc[];
    total: number;
};

type Props = {
    kocs?: Koc[];
};

export default function CardKocJoinByPruductCategory({ kocs }: Props) {
    const rows = kocs ?? [];

    // Gom toàn bộ KOC đã tham gia theo từng danh mục sản phẩm
    const data = useMemo<Row[]>(() => {
        const map = new Map<string, Koc[]>();
        for (const koc of rows) {
            const key = koc.productCategory || 'Khác';
            const list = map.get(key) ?? [];
            list.push(koc);
            map.set(key, list);
        }
        return [...map.entries()]
            .map(([category, list]) => ({
                category,
                kocs: [...list].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)),
                total: list.reduce((sum, k) => sum + (k.revenue || 0), 0),
            }))
            .sort((a, b) => b.total - a.total);
    }, [rows]);

    const [selected, setSelected] = useState<Row | null>(null);

    const columns: ColumnsType<Row> = [
        {
            title: 'Danh mục sản phẩm',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Số KOC',
            key: 'count',
            align: 'center',
            width: 90,
            render: (_, row) => row.kocs.length,
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

    const modalColumns: ColumnsType<Koc> = [
        { title: 'Tên KOC', dataIndex: 'name', key: 'name' },
        {
            title: 'Tier',
            dataIndex: 'tier',
            key: 'tier',
            render: (tier: string) => <Tag color="blue">{tier}</Tag>,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (v: number) => compactVND(v || 0),
        },
        {
            title: 'GMV',
            dataIndex: 'gmv',
            key: 'gmv',
            align: 'right',
            render: (v: number) => compactVND(v || 0),
        },
        {
            title: 'Followers',
            dataIndex: 'followers',
            key: 'followers',
            align: 'right',
            render: (v: number) => (v || 0).toLocaleString('vi-VN'),
        },
    ];

    return (
        <Card style={{ borderRadius: 8 }}>
            <Title level={5} style={{ marginTop: 0 }}>
                KOC đã tham gia theo danh mục sản phẩm
            </Title>
            <Text type="secondary">
                Nhấn "Chi tiết" để xem toàn bộ KOC đã tham gia của danh mục
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
                title={
                    selected
                        ? `KOC đã tham gia — ${selected.category} (${selected.kocs.length})`
                        : 'KOC đã tham gia'
                }
                open={selected !== null}
                onCancel={() => setSelected(null)}
                onOk={() => setSelected(null)}
                okText="Đóng"
                cancelButtonProps={{ style: { display: 'none' } }}
                width={720}
            >
                {selected && (
                    <Table<Koc>
                        size="small"
                        rowKey="name"
                        columns={modalColumns}
                        dataSource={selected.kocs}
                        pagination={false}
                    />
                )}
            </Modal>
        </Card>
    );
}
