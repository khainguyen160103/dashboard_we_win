import { useMemo, useState } from 'react';
import { Button, Card, Descriptions, Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Koc } from '../../model/User';

const { Title, Text } = Typography;

// Trạng thái được coi là "chưa từng hợp tác"
const NOT_JOINED_STATUS = 'Tiềm năng';

const fmtNumber = (v?: number) => (v || 0).toLocaleString('vi-VN');

type Props = {
    kocs?: Koc[];
};

export default function CardKocNotJoin({ kocs }: Props) {
    const rows = kocs ?? [];

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
