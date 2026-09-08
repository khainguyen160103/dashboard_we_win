import { Card, Space, Typography } from "antd";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useKoc } from "../../hooks/query";


const { Title } = Typography;
ChartJS.register(ArcElement, Tooltip, Legend);
export default function CardChartByFollower() {
    const { data: kocs } = useKoc()
    const nanoKocs = kocs?.filter(koc => koc.followers < 50000).length || 0;
    const microKocs = kocs?.filter(koc => koc.followers >= 50000 && koc.followers < 300000).length || 0;
    const macroKocs = kocs?.filter(koc => koc.followers >= 300000 && koc.followers < 1000000).length || 0;
    const megaKocs = kocs?.filter(koc => koc.followers >= 1000000).length || 0;
    const data = {
        labels: ['Nano', 'Micro', 'Macro', 'Mega'],
        datasets: [
            {
                label: 'Số lượng KOC',
                data: [nanoKocs, microKocs, macroKocs, megaKocs],
                backgroundColor: [
                    '#2a78d6',
                    '#eb6834',
                    '#1baf7a',
                    '#eda100',
                   
                ],
                borderColor: [
                    '#2a78d6',
                    '#eb6834',
                    '#1baf7a',
                    '#eda100',
                ],
                borderWidth: 1,
            },
        ],
    };

    return <Card style={{ borderRadius: 8 }}
    >   
    <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Title level={5}>Phân bổ theo Tier</Title>
        <h1>Theo lượng người theo dõi</h1>

    </Space>


    <Space direction="vertical" size={0} style={{ width: '50%' }}>
        <Doughnut data={data} />
    </Space>
     
    </Card>

}