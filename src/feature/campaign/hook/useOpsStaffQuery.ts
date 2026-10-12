import { useQuery } from "@tanstack/react-query";
import userService from "../../../services/user.service";
import type { User } from "../../../model/User";

const hasRole = (u: User, role: string) =>
  (u.roles ?? []).some((r) => String(r).toUpperCase() === role);

/** Toàn bộ nhân sự nội bộ (GET /api/users — chỉ Admin có quyền xem). */
export const useStaffQuery = () =>
  useQuery({
    queryKey: ["users", "staff"],
    queryFn: () => userService.list({ page: 0, size: 500 }),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

/** Options cho Select theo role: PM · SA (Account) · OP (Vận hành). */
export const useStaffOptions = (role: "PM" | "SA" | "OP") => {
  const q = useStaffQuery();
  const options = (q.data ?? [])
    .filter((u) => hasRole(u, role))
    .map((u) => ({ value: String(u.id), label: u.fullName || u.email }));
  return { ...q, options };
};

/** Nhân sự Vận hành = user có role OP — trả về danh sách tên. */
export const useOpsStaffQuery = () => {
  const q = useStaffQuery();
  return { ...q, data: (q.data ?? []).filter((u) => hasRole(u, "OP")).map((u) => u.fullName || u.email) };
};
