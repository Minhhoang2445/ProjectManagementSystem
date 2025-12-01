import AdminSidebar from "../components/admin/AdminSidebar";
import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
