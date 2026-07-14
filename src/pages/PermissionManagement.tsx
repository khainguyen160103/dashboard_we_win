import ComponentCard from "../components/common/ComponentCard";
import PageBreadCrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useMemo, useState } from "react";

type PermissionKey =
  | "dashboard"
  | "campaign"
  | "job"
  | "reports"
  | "users"
  | "roles";

type PermissionColumn = {
  key: PermissionKey;
  label: string;
  description: string;
};

type RolePermissionRow = {
  roleName: string;
  description: string;
  permissions: Record<PermissionKey, boolean>;
};

type DemoUser = {
  id: string;
  name: string;
  email: string;
  roleName: RolePermissionRow["roleName"];
  note: string;
};

const permissionColumns: PermissionColumn[] = [
  { key: "dashboard", label: "Dashboard", description: "Xem tổng quan hệ thống" },
  { key: "campaign", label: "Chiến dịch", description: "Xem và thao tác chiến dịch" },
  { key: "job", label: "Job & Video", description: "Duyệt và theo dõi video" },
  { key: "reports", label: "Báo cáo", description: "Xem báo cáo và nghiệm thu" },
  { key: "users", label: "Người dùng", description: "Quản lý KOC và tài khoản" },
  { key: "roles", label: "Phân quyền", description: "Quản lý vai trò và quyền" },
];

const rolePermissions: RolePermissionRow[] = [
  {
    roleName: "SUPER_ADMIN",
    description: "Quản trị chung",
    permissions: {
      dashboard: true,
      campaign: true,
      job: true,
      reports: true,
      users: true,
      roles: true,
    },
  },
  {
    roleName: "SALES_ACCOUNT",
    description: "Nhân viên Sales",
    permissions: {
      dashboard: true,
      campaign: true,
      job: false,
      reports: true,
      users: false,
      roles: false,
    },
  },
  {
    roleName: "OPERATION",
    description: "Nhân viên Vận hành (PM)",
    permissions: {
      dashboard: true,
      campaign: true,
      job: true,
      reports: true,
      users: false,
      roles: false,
    },
  },
  {
    roleName: "KOC",
    description: "Người dùng KOC",
    permissions: {
      dashboard: true,
      campaign: true,
      job: true,
      reports: false,
      users: false,
      roles: false,
    },
  },
];

const demoUsers: DemoUser[] = [
  {
    id: "u1",
    name: "Nguyễn Anh Tú",
    email: "antu@demo.vn",
    roleName: "SALES_ACCOUNT",
    note: "Phụ trách tư vấn và theo dõi chiến dịch",
  },
  {
    id: "u2",
    name: "Trần Minh Quân",
    email: "quanm@demo.vn",
    roleName: "OPERATION",
    note: "Theo dõi tiến độ job và xử lý duyệt video",
  },
  {
    id: "u3",
    name: "Lê Thảo Vy",
    email: "vylt@demo.vn",
    roleName: "KOC",
    note: "Tài khoản KOC tham gia campaign",
  },
  {
    id: "u4",
    name: "Phạm Đức Huy",
    email: "huypd@demo.vn",
    roleName: "SUPER_ADMIN",
    note: "Quản trị hệ thống và phân quyền",
  },
];

export default function PermissionManagement() {
  const [selectedUserId, setSelectedUserId] = useState(demoUsers[0].id);

  const selectedUser = useMemo(
    () => demoUsers.find((user) => user.id === selectedUserId) ?? demoUsers[0],
    [selectedUserId]
  );

  const selectedRole = rolePermissions.find(
    (role) => role.roleName === selectedUser.roleName
  );

  return (
    <>
      <PageMeta
        title="Sơ đồ phân quyền"
        description="Ma trận phân quyền theo role cho bản demo hệ thống"
      />
      <PageBreadCrumb pageTitle="Sơ đồ phân quyền người dùng trong hệ thống" />

      <div className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role - permission matrix
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
            Sơ đồ phân quyền người dùng trong hệ thống
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Mỗi ô checkbox thể hiện quyền truy cập của từng role. Dữ liệu là mock data phục vụ demo, vẫn giữ nguyên style của template.
          </p>
        </div>

        <ComponentCard
          title="Chọn người dùng để phân quyền"
          desc="Chọn một user để xem role hiện tại và các quyền đi kèm"
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Người dùng
              </label>
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {demoUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Thông tin người dùng
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vai trò hiện tại: {selectedUser.roleName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.note}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role đang áp dụng
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedRole?.roleName}
                  </h3>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  Demo only
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {permissionColumns.map((column) => {
                  const isChecked = Boolean(selectedRole?.permissions[column.key]);

                  return (
                    <label
                      key={column.key}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {column.label}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {column.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard
          title="Ma trận role & permission"
          desc="Các ô checkbox ở chế độ read-only cho bản demo"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 border-b border-gray-200 bg-white px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                    Role
                  </th>
                  <th className="border-b border-gray-200 px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200">
                    Mô tả
                  </th>
                  {permissionColumns.map((column) => (
                    <th
                      key={column.key}
                      className="border-b border-gray-200 px-5 py-4 text-center text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200"
                    >
                      <div>{column.label}</div>
                      <div className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                        {column.description}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rolePermissions.map((role, roleIndex) => (
                  <tr
                    key={role.roleName}
                    className={roleIndex % 2 === 0 ? "bg-gray-50/60 dark:bg-white/[0.02]" : "bg-white dark:bg-transparent"}
                  >
                    <td className="sticky left-0 z-10 border-b border-gray-100 bg-inherit px-5 py-4 font-medium text-gray-900 dark:border-gray-800 dark:text-white">
                      {role.roleName}
                    </td>
                    <td className="border-b border-gray-100 px-5 py-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
                      {role.description}
                    </td>
                    {permissionColumns.map((column) => (
                      <td
                        key={column.key}
                        className="border-b border-gray-100 px-5 py-4 text-center dark:border-gray-800"
                      >
                        <label className="inline-flex cursor-pointer items-center justify-center">
                          <input
                            type="checkbox"
                            checked={role.permissions[column.key]}
                            readOnly
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="sr-only">
                            {role.roleName} {column.label}
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
