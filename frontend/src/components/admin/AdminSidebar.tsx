import { NavLink } from "react-router";
import { Home, Users, Settings } from "lucide-react";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
const nav = [
  { name: "Dashboard", icon: Home, path: "/admin" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-16 flex items-center px-6 text-xl font-bold">
        Admin Panel
      </div>

      <nav className="px-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
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
