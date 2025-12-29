import { NavLink, useParams } from "react-router";
import { BarChart3, LayoutGrid, List } from "lucide-react";

const tabs = [
  { label: "Summary", path: "summary", icon: BarChart3 },
  { label: "Board", path: "board", icon: LayoutGrid },
  { label: "List", path: "list", icon: List },
];

export default function TaskNavbar() {
  const { projectId } = useParams();

  return (
    <div className="w-full pt-5 border-b bg-white">
      <div className="flex gap-1 px-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={`/user/spaces/${projectId}/${tab.path}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
