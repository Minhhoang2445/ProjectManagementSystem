import { useMemo } from "react";
import { useNavigate } from "react-router";
import type { Project } from "@/types/Project";
import type { Task } from "@/types/Task";

const PROJECT_STATUS_LABELS: Record<Project["status"], string> = {
    planned: "Planned",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

const getCompletionStats = (tasks?: Task[]) => {
    const normalizedTasks = Array.isArray(tasks) ? tasks : [];
    const done = normalizedTasks.filter((task) => task.status === "done").length;
    const total = normalizedTasks.length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    return { done, total, completion };
};

export function ProjectCard({ project }: { project: Project }) {
    const navigate = useNavigate();
    const { completion, done, total } = useMemo(() => getCompletionStats(project.tasks), [project.tasks]);

    const accentColor = project.color || "#0ea5e9";

    return (
        <div
            className="cursor-pointer rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            onClick={() => navigate(`/admin/projects/${project.id}`)}
        >
            {/* HEADER */}
            <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium text-slate-900" style={{ color: project.color || undefined }}>
                    {project.name}
                </h2>

                <span
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-700"
                    style={{
                        backgroundColor: project.color ? `${project.color}20` : undefined,
                        color: project.color || undefined,
                    }}
                >
                    {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                </span>
            </div>

            {/* DESCRIPTION */}
            <p className="mb-4 text-sm text-slate-600">{project.description || "No description provided."}</p>

            {/* PROGRESS BAR */}
            <div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${accentColor}, #22c55e)`,
                            width: `${completion}%`,
                        }}
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    {done}/{total || 0} tasks done · {completion}% complete
                </p>
            </div>
        </div>
    );
}
