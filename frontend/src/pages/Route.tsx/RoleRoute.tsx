import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";

export function RoleRoute({ role }: { role: "admin" | "user" }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/signin" replace />;

  const currentRole = user.role === "staff" ? "user" : "admin";

  if (currentRole !== role) {
    return <Navigate to={`/${currentRole}`} replace />;
  }

  return <Outlet />;
}
