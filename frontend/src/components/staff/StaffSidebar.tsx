import { NavLink } from "react-router";
import { Home, ListChecks,User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut } from "lucide-react";
const nav = [
  { name: "Home", icon: Home, path: "/user" },
  { name: "My Tasks", icon: ListChecks, path: "/user/tasks" },
  { name: "Profile", icon: User, path: "/user/profile" }

];

export default function StaffSidebar() {
  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-16 flex items-center px-6 text-xl font-bold">
        Staff Panel
      </div>

      <nav className="px-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/user"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium 
                 ${isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"}`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <button
          onClick={() => useAuthStore.getState().signOut()}
          className="
      w-full flex items-center gap-3 px-3 py-2 rounded-md 
      text-sm font-medium text-red-600 
      hover:bg-red-100 hover:text-red-700
    "
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
