import AdminSidebar from "../components/admin/AdminSidebar";
import { Outlet } from "react-router";
import TopNavbar from "@/components/ui/Navbar";
export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden flex-col">
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto ">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

