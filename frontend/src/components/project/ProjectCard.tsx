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

const STATUS_STYLES: Record<Project["status"], { text: string; bg: string; border: string }> = {
    planned: {
        text: "text-slate-700",
        bg: "bg-slate-100",
        border: "border-slate-200",
    },
    in_progress: {
        text: "text-sky-700",
        bg: "bg-sky-50",
        border: "border-sky-200",
    },
    completed: {
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
    },
    cancelled: {
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
    },
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
    const statusStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.planned;

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
                    className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusStyle.text} ${statusStyle.bg} ${statusStyle.border}`}
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
