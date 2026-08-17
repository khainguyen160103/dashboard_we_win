import { Navigate, Outlet, useLocation } from "react-router";
import type { ReactNode } from "react";
import { authStore } from "../../store/authStore";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export default function ProtectedRoute({
  children,

}: ProtectedRouteProps) {
  const { isAuthenticated } = authStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
