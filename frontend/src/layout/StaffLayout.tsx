import StaffSidebar from "../components/staff/StaffSidebar.tsx";
import { Outlet } from "react-router";
import  TopNavbar  from "@/components/Navbar.tsx";
export default function StaffLayout() {
  return (
    <div className="flex h-screen overflow-hidden flex-col">
          <TopNavbar />
    
          <div className="flex flex-1 overflow-hidden">
          <StaffSidebar />
    
            <main className="flex-1 overflow-y-auto  bg-gray-50">
              <Outlet />
            </main>
    
          </div>
        </div>
  );
}
