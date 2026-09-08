import { Navigate, Outlet, useLocation } from "react-router";
import type { ReactNode } from "react";
import { authStore } from "../../store/authStore";
import { getActiveUserRole } from "../../utils/rbac";

type ProtectedRouteProps = {
  children?: ReactNode;
};

/** Role KOC / BRAND chỉ được xem đúng /dashboard (Cổng KOC / Cổng Brand). */
const DASHBOARD_ONLY_ROLES = ["KOC", "BRAND"] as const;
const ALLOWED_PATHS_FOR_RESTRICTED = ["/dashboard"];

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
  const restricted = (DASHBOARD_ONLY_ROLES as readonly string[]).includes(role);
  if (restricted && !ALLOWED_PATHS_FOR_RESTRICTED.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
