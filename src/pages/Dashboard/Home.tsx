import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

const screenList = [
  {
    number: "01",
    title: "Dashboard tổng quan",
    description: "Trang tổng quan các chỉ số vận hành và trạng thái chiến dịch.",
    path: "/kpi",
    className: "bg-slate-900",
  },
  {
    number: "02",
    title: "Database KOC",
    description: "Danh sách hồ sơ KOC, trạng thái duyệt và thông tin liên hệ.",
    path: "/user-management",
    className: "bg-brand-700",
  },
  {
    number: "03",
    title: "Chiến dịch",
    description: "Quản lý chiến dịch, tiến độ, ngân sách và kế hoạch triển khai.",
    path: "/campaign-management",
    className: "bg-cyan-700",
  },
  {
    number: "04",
    title: "Job & Duyệt Video",
    description: "Theo dõi job, kiểm duyệt video và trạng thái xử lý.",
    path: "/job-review",
    className: "bg-brand-600",
  },
  {
    number: "05",
    title: "Cổng tự phục vụ KOC",
    description: "Màn hình dành cho KOC tham gia chiến dịch và nộp video.",
    path: "/profile",
    className: "bg-amber-500",
  },
  {
    number: "06",
    title: "Báo cáo & Nghiệm thu",
    description: "Tổng hợp báo cáo, đầu việc nghiệm thu và lịch bàn giao.",
    path: "/basic-tables",
    className: "bg-teal-600",
  },
  {
    number: "07",
    title: "Cập nhật Follow / GMV",
    description: "Theo dõi tiến độ follow, đơn hàng và số liệu GMV.",
    path: "/calendar",
    className: "bg-sky-700",
  },
  {
    number: "08",
    title: "Quản trị & Phân quyền",
    description: "Quản lý role, quyền truy cập và luồng phê duyệt.",
    path: "/permission-management",
    className: "bg-slate-800",
  },
];

export default function Home() {
  return (
    <>
      <PageMeta
        title="Danh sách màn hình"
        description="Màn hình danh sách các khu vực chính của hệ thống demo"
      />
      <PageBreadcrumb pageTitle="Danh sách màn hình" />

      <div className="space-y-8">
        <section className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
            Screen list
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
            Danh sách màn hình (Screen List) dự kiến của hệ thống
          </h1>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {screenList.map((screen) => (
            <Link
              key={screen.number}
              to={screen.path}
              className={`group flex min-h-56 flex-col rounded-2xl px-8 py-7 text-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg ${screen.className}`}
            >
              <span className="text-3xl font-semibold opacity-90">
                {screen.number}
              </span>
              <div className="flex flex-1 items-center justify-center text-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold leading-tight">
                    {screen.title}
                  </h2>
                  <p className="text-sm leading-6 text-white/85">
                    {screen.description}
                  </p>
                </div>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-white">
                Xem màn hình
              </span>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/30">
          <p className="text-lg italic text-gray-600 dark:text-gray-300">
            Giai đoạn 2 (sau): bổ sung thêm màn hình 09 - Chấm công & Tính lương
          </p>
        </section>
      </div>
    </>
  );
}
