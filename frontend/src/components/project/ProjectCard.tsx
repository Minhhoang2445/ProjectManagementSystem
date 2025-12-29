import { useNavigate } from "react-router";
export function ProjectCard({ project }: { project: any }) {
    const navigate = useNavigate();
    return (
        <div
            className="cursor-pointer rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-blue-500/40 dark:hover:bg-slate-900"
            onClick={() => navigate(`/admin/projects/${project.id}`)}
        >
            {/* HEADER */}
            <div className="mb-3 flex items-center justify-between">
                <h2
                    className="font-medium text-slate-900 dark:text-white"
                    style={{ color: project.color || undefined }}
                >
                    {project.name}
                </h2>

                <span
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    style={{
                        backgroundColor: project.color ? `${project.color}20` : undefined,
                        color: project.color || undefined,
                    }}
                >
                    {project.status}
                </span>
            </div>

            {/* DESCRIPTION */}
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                {project.description}
            </p>

            {/* PROGRESS BAR */}
            <div>
                <div className="mb-1 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div
                    className="h-2 rounded-full"
                    style={{
                        backgroundColor: project.color,
                        width: `${project.progress}%`,
                        marginTop: "-0.5rem",
                    }}
                ></div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {project.progress}% completed
                </p>
            </div>
        </div>
    );
}
