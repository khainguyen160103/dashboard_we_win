import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";

export default function UserManagement() {
  const users = [
    {
      id: 1,
      name: "Nguyen Van A",
      email: "nguyenvana@gmail.com",
      role: "Admin",
      status: "Active",
      joinDate: "2024-01-15",
      campaigns: 45,
    },
    {
      id: 2,
      name: "Tran Thi B",
      email: "tranthib@gmail.com",
      role: "Affiliate",
      status: "Active",
      joinDate: "2024-02-20",
      campaigns: 38,
    },
    {
      id: 3,
      name: "Le Van C",
      email: "levanc@gmail.com",
      role: "Affiliate",
      status: "Inactive",
      joinDate: "2024-03-10",
      campaigns: 32,
    },
    {
      id: 4,
      name: "Pham Thi D",
      email: "phamthid@gmail.com",
      role: "Manager",
      status: "Active",
      joinDate: "2024-01-05",
      campaigns: 28,
    },
    {
      id: 5,
      name: "Hoang Van E",
      email: "hoangvane@gmail.com",
      role: "Affiliate",
      status: "Active",
      joinDate: "2024-04-12",
      campaigns: 24,
    },
    {
      id: 6,
      name: "Vu Thi F",
      email: "vuthif@gmail.com",
      role: "Affiliate",
      status: "Active",
      joinDate: "2024-05-08",
      campaigns: 18,
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <>
      <PageMeta
        title="Quản lý người dùng"
        description="Trang quản lý người dùng với mock data demo"
      />
      <PageBreadcrumb pageTitle="Quản lý người dùng" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { title: "Tổng user", value: "124", tone: "bg-sky-50 dark:bg-sky-900/20" },
          { title: "Active", value: "108", tone: "bg-green-50 dark:bg-green-900/20" },
          { title: "Inactive", value: "16", tone: "bg-slate-50 dark:bg-slate-800/60" },
          { title: "Admin/Manager", value: "11", tone: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((metric) => (
          <div
            key={metric.title}
            className={`rounded-2xl border border-gray-200 p-5 ${metric.tone} dark:border-gray-800`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <button className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          + Thêm Người Dùng
        </button>
      </div>

      <ComponentCard
        title="Danh Sách Người Dùng"
        desc="Mock data hồ sơ KOC, vai trò và trạng thái hoạt động"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tên
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Vai Trò
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ngày Tham Gia
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.joinDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Sửa
                      </button>
                      <button className="text-red-600 hover:text-red-700 dark:text-red-400">
                        Xóa
                      </button>
                    </div>
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
