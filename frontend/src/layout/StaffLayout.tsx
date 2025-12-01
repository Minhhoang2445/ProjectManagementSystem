import StaffSidebar from "../components/staff/StaffSidebar.tsx";
import { Outlet } from "react-router";

export default function StaffLayout() {
  return (
    <div className="flex">
      <StaffSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
