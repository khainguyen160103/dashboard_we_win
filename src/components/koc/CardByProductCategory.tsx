import { Card, Space, Typography } from "antd";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Koc } from "../../model/User";

const { Title: TitleFont } = Typography;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PALETTE = [
    '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#9b59b6',
    '#e74c3c', '#16a085', '#f39c12', '#2c3e50', '#c0392b',
];

const compactVND = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
    if (v >= 1e6) return `${Math.round(v / 1e6)} tr`;
    return v.toLocaleString('vi-VN');
};

interface Props {
    kocs?: Koc[];
}

export default function CardByProductCategory({ kocs }: Props) {
    const rows = kocs ?? [];

    // Gom tổng GMV theo danh mục sản phẩm
    const totals = new Map<string, number>();
    for (const koc of rows) {
        const key = koc.productCategory || 'Khác';
        totals.set(key, (totals.get(key) ?? 0) + (koc.gmv || 0));
    }

    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([name]) => name);
    const values = sorted.map(([, total]) => total);

    const data = {
        labels,
        datasets: [
            {
                label: 'Tổng GMV (₫)',
                data: values,
                backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length] + 'cc'),
                borderColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: TooltipItem<'bar'>) => ` ${compactVND(Number(ctx.parsed.x))}`,
                },
            },
        },
        scales: {
            x: {
                ticks: { callback: (v) => compactVND(Number(v)) },
            },
        },
    };

    return (
        <Card style={{ borderRadius: 8 }}>
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <TitleFont level={5}>Phân bổ GMV theo danh mục sản phẩm</TitleFont>
                <span style={{ color: '#8c8c8c' }}>Tổng doanh số (₫) của KOC theo từng danh mục</span>
            </Space>

            <div className="chart-container" style={{ width: '100%', height: 320, marginTop: 12 }}>
                <Bar options={options} data={data} />
            </div>
        </Card>
    );
}
