import { Navigate, Outlet, useLocation } from "react-router";
import type { ReactNode } from "react";
import { authStore } from "../../store/authStore";
import { getActiveUserRole } from "../../utils/rbac";

type ProtectedRouteProps = {
  children?: ReactNode;
};

/**
 * Role bị giới hạn trang được vào (path đầu tiên = trang chủ của role):
 *  - KOC   : Cổng KOC ở /dashboard
 *  - BRAND : chỉ menu "Vận hành chiến dịch" (/campaign hiển thị Cổng Brand)
 */
const RESTRICTED_PATHS: Record<string, string[]> = {
  KOC: ["/dashboard"],
  BRAND: ["/campaign"],
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { checkAuth, user } = authStore();
  const location = useLocation();

  // Token in localStorage survives a page refresh (F5), so this stays true.
  if (!checkAuth()) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // After F5 the store is empty until /auth/me resolves — don't run role
  // redirects against a null user.
  if (!user) {
    return children ? <>{children}</> : <Outlet />;
  }

  const role = getActiveUserRole(user);
  const allowed = RESTRICTED_PATHS[role];
  if (allowed && !allowed.includes(location.pathname)) {
    return <Navigate to={allowed[0]} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
