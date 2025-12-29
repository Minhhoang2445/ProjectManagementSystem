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
        <div className="w-full border-b border-slate-200 bg-white/90 pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="px-6">
                <div className="flex gap-4">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={`/admin/projects/${projectId}/${tab.path}`}
                            className={({ isActive }) =>
                                `group flex items-center gap-2 rounded-t-md border-b-2 px-3 py-3 text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? "border-blue-600 text-blue-700 bg-blue-50/60 dark:border-blue-400 dark:text-blue-200 dark:bg-blue-500/10"
                                    : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/70"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <tab.icon
                                        size={18}
                                        className={`transition-colors duration-200 ${isActive ? "text-blue-600 dark:text-blue-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`}
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