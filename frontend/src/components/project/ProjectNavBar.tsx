import { Link, useParams, useLocation } from "react-router";

export default function ProjectNavBar() {
    const { projectId } = useParams<{ projectId: string }>();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const tabClass = (active: boolean) =>
        `pb-1 px-2 border-b-2 transition-colors ${active
            ? "border-blue-500 text-blue-600 font-semibold"
            : "border-transparent text-slate-600 hover:text-blue-500 hover:border-blue-300"
        }`;

    return (
        <div className="flex-col rounded-b-2xl border border-slate-200 bg-white/90 pt-4 px-4 pb-1 shadow-sm backdrop-blur">
            <h1 className="text-xl font-semibold text-slate-900">Project Management</h1>

            <div className="mt-3 flex gap-6 text-sm">
                <Link
                    to="/admin/projects"
                    className={tabClass(isActive("/admin/projects"))}
                >
                    Overview
                </Link>

                <Link
                    to="/admin/projects/list"
                    className={tabClass(isActive("/admin/projects/list"))}
                >
                    Project List
                </Link>

                <Link
                    to="/admin/projects/create"
                    className={tabClass(isActive("/admin/projects/create"))}
                >
                    Create Project
                </Link>

                {projectId && (
                    <>
                        <Link
                            to={`/admin/project/${projectId}`}
                            className={tabClass(isActive(`/admin/project/${projectId}`))}
                        >
                            Project Details
                        </Link>

                        <Link
                            to={`/admin/projects/${projectId}/tasks/create`}
                            className={tabClass(
                                isActive(`/admin/projects/${projectId}/tasks/create`)
                            )}
                        >
                            Create Task
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
