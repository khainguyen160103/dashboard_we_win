import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";

// Register Chart.js modules required for Line & Doughnut charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

export default function KPIDashboard() {
  const kpiMetrics = [
    {
      title: "Campaign đang chạy",
      value: "15",
      change: "+2 chiến dịch",
      color: "text-sky-700 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-900/20",
    },
    {
      title: "Hồ sơ KOC chờ duyệt",
      value: "38",
      change: "+6 hồ sơ",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Video chờ duyệt",
      value: "62",
      change: "+14 video",
      color: "text-teal-700 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      title: "Job đã hoàn thành",
      value: "452",
      change: "+38 job",
      color: "text-slate-800 dark:text-slate-200",
      bgColor: "bg-slate-50 dark:bg-slate-800/60",
    },
  ];

  const campaignRows = [
    {
      name: "Comfort - Mùa hè 2026",
      brand: "Unilever",
      progress: 80,
      status: "Đang chạy",
    },
    {
      name: "Sữa rửa mặt X",
      brand: "La Roche-Posay",
      progress: 45,
      status: "Đang chạy",
    },
    {
      name: "Ra mắt sản phẩm Y",
      brand: "Samsung Vietnam",
      progress: 95,
      status: "Sắp xong",
    },
    {
      name: "Khuyến mãi tháng 7",
      brand: "Cocoon Vietnam",
      progress: 15,
      status: "Mới bắt đầu",
    },
  ];

  // ── Đồ thị 1: Biểu đồ Đường/Vùng (Line Chart) — Tăng trưởng Video & KOC ─────
  const lineChartData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Số Video hoàn thành",
        data: [65, 85, 120, 190, 240, 310],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#1890ff",
        pointRadius: 4,
      },
      {
        label: "KOC mới đăng ký",
        data: [20, 35, 45, 60, 80, 110],
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#52c41a",
        pointRadius: 4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: { family: "Inter, sans-serif", size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
    },
  };

  // ── Đồ thị 2: Biểu đồ Tròn (Doughnut Chart) — Phân bổ KOC theo Nền tảng ──────
  const doughnutChartData = {
    labels: ["TikTok", "Instagram", "YouTube", "Facebook"],
    datasets: [
      {
        label: "Số lượng KOC",
        data: [48, 32, 15, 5],
        backgroundColor: [
          "#000000", // TikTok
          "#e1306c", // Instagram
          "#ff0000", // YouTube
          "#1877f2", // Facebook
        ],
        hoverOffset: 6,
        borderWidth: 2,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { family: "Inter, sans-serif", size: 12 },
          usePointStyle: true,
          padding: 16,
        },
      },
    },
    cutout: "68%",
  };

  return (
    <>
      <PageMeta
        title="KPIDashboard — Báo cáo tổng quan"
        description="Trang Dashboard tổng quan với đồ thị báo cáo react-chartjs-2"
      />
      <PageBreadcrumb pageTitle="Dashboard tổng quan (KPIs)" />

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <div
            key={index}
            className={`rounded-2xl border border-gray-200 ${metric.bgColor} p-6 dark:border-gray-800`}
          >
            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {metric.title}
            </h3>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-bold ${metric.color}`}>
                {metric.value}
              </p>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Đồ thị 1 & Đồ thị 2 (ChartJS Report Section) */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Đồ thị 1: Tăng trưởng Video & KOC (Line Chart) */}
        <div className="lg:col-span-2">
          <ComponentCard
            title="Báo cáo Tăng trưởng Video & KOC"
            desc="Theo dõi số lượng Video đã duyệt và KOC mới qua các tháng"
          >
            <div style={{ height: 320 }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </ComponentCard>
        </div>

        {/* Đồ thị 2: Phân bổ Nền tảng (Doughnut Chart) */}
        <div>
          <ComponentCard
            title="Phân bổ KOC theo Nền tảng"
            desc="Tỷ lệ KOC trên các nền tảng mạng xã hội"
          >
            <div style={{ height: 320 }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </ComponentCard>
        </div>
      </div>

      {/* Campaign Status Table */}
      <ComponentCard
        title="Danh sách chiến dịch nổi bật"
        desc="Theo dõi tiến độ, trạng thái và nhãn hàng trong cùng một bảng"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Chiến dịch
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nhãn hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tiến độ
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {campaignRows.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {row.brand}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-full max-w-72 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="min-w-12 text-right text-sm text-gray-500 dark:text-gray-400">
                        {row.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </>
  );
}
