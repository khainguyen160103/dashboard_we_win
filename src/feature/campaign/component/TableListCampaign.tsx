import { Button, Table } from 'antd';
import { useModal } from '../../../hooks/useModal';
import { DetailCampaignModal } from './DetailCampaignModal';
const dataSource = [
    {
        key: '1',
        name: 'Mike',
        age: 32,
        address: '10 Downing Street',
    },
    {
        key: '2',
        name: 'John',
        age: 42,
        address: '10 Downing Street',
    },
];


export const TableListCampaign = () => {
    const {isOpen, closeModal, openModal} = useModal()
    const handleOpenModalDeltail = (record: any) => { 
        openModal()
        console.log("open modal check, ", record)
    }
    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Trạng nhãn hàng',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: '% Tiến độ',
            dataIndex: 'address',
            key: 'address',
        }, {
            title: 'Ngân sách',
            dataIndex: 'address',
            key: 'address',
        }, {
            title: 'GMV',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Thời gian',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Koc tham gia',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Hành động',
            key: 'address',
            render: (_: any, record: any) => <Button type='link' onClick={() => handleOpenModalDeltail(record) }>Xem chi tiết</Button>
        },
    ];

    return (
        <> 
        
        <Table dataSource={dataSource} columns={columns} />
        <DetailCampaignModal isOpen={isOpen} onClose={closeModal} />
        </>
    )
}
