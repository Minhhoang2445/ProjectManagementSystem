import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

export function RoleRoute({ role }: { role: "admin" | "staff" }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/signin" replace />;

  // Nếu sai role → đá về dashboard đúng của role đó
  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}
