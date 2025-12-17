import { NavLink, useParams } from "react-router";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
} from "lucide-react";

const tabs = [
    { label: "Overview", path: "overview", icon: LayoutDashboard },
    { label: "Tasks", path: "tasks", icon: CheckSquare },
    { label: "Members", path: "members", icon: Users },
];

export default function ProjectDetailNavBar() {
    const { projectId } = useParams();

    return (
        <div className="w-full pt-3">
            {/* Container giới hạn độ rộng (optional) */}
            <div className="px-6">
                <div className="flex gap-4">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={`/admin/projects/${projectId}/${tab.path}`}

                            className={({ isActive }) =>
                                `
                                group flex items-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 border-b-2
                                ${isActive
                                    ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-md"
                                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 hover:rounded-t-md"
                                }
                                `
                            }
                        >
                            {/* Render Icon logic */}
                            {({ isActive }) => (
                                <>
                                    <tab.icon
                                        size={18}
                                        className={`transition-colors duration-200 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                            }`}
                                    />
                                    <span>{tab.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}