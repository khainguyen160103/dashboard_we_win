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

type Row = { category: string; koc: Koc };

type Props = {
    kocs?: Koc[];
};

export default function CardTopKocByProduct({ kocs }: Props) {
    const rows = kocs ?? [];

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
