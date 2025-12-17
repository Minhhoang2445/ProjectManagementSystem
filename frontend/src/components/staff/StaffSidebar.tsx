import { NavLink, useLocation } from "react-router";
import { Home, ListChecks, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut } from "lucide-react";

import type { Project } from "@/types/Project";
import React from "react";
import { projectService } from "@/services/projectService";
import { toast } from "sonner";
import { set } from "zod";

export default function StaffSidebar() {
  const [openSpaces, setOpenSpaces] = useState(true);
  const location = useLocation();
  const [spaces, setSpaces] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);


  const loadProjects = async () => {
    try {
      setLoading(true);
      const projects = await projectService.getUserProjects();
      setSpaces(projects);
    }
    catch (error) {
      console.error("Failed to load spaces:", error);
      toast.error("Failed to load spaces");
      setSpaces([]);
    }
    finally {
      setLoading(false);
    }
  };      
  React.useEffect(() => {
    loadProjects();
  }, []);

  const isSpacesActive = location.pathname.startsWith("/user/spaces");

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-16 flex items-center px-6 text-xl font-bold">
        Staff Panel
      </div>

      <nav className="px-3 space-y-1">

        {/* Home */}
        <NavLink
          to="/user"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium 
            ${isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"}`
          }
        >
          <Home size={18} />
          Home
        </NavLink>

        {/* My Spaces (Dropdown) */}
        <button
          onClick={() => setOpenSpaces(!openSpaces)}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium
            ${isSpacesActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"}
          `}
        >
          <div className="flex items-center gap-3">
            <ListChecks size={18} />
            My spaces
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform ${openSpaces ? "rotate-180" : ""}`}
          />
        </button>

        {/* Space list */}
        {openSpaces && (
          <div className="ml-6 mt-1 space-y-1">
            {spaces.map((space) => (
              <NavLink
                key={space.id}
                to={`/user/spaces/${space.id}`}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-md text-sm
                  ${isActive
                    ? "bg-sidebar-accent font-medium"
                    : "hover:bg-sidebar-accent/60"}`
                }
              >
                {space.name}
              </NavLink>
            ))}
          </div>
        )}

        {/* Profile */}
        <NavLink
          to="/user/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium 
            ${isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"}`
          }
        >
          <User size={18} />
          Profile
        </NavLink>
      </nav>

      {/* Logout */}
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
