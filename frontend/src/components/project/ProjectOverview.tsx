import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { AlertTriangle, CalendarClock, CheckCircle, ListChecks, Users } from "lucide-react";
import type { Project } from "@/types/Project";
import type { Task } from "@/types/Task";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";

type OutletContext = {
    project: Project;
};

const formatDate = (value?: string | null, fallback = "—") => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const daysBetween = (from?: string | null, to?: string | null) => {
    const start = from ? new Date(from) : null;
    const end = to ? new Date(to) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const daysUntil = (to?: string | null) => {
    if (!to) return null;
    const target = new Date(to);
    if (Number.isNaN(target.getTime())) return null;
    return Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const STATUS_LABELS: Record<Task["status"], string> = {
    to_do: "To do",
    in_progress: "In progress",
    review: "In review",
    done: "Done",
    cancelled: "Cancelled",
};

export default function ProjectOverview() {
    const { project } = useOutletContext<OutletContext>();
    const { projectId } = useParams();
    const [analyticsProject, setAnalyticsProject] = useState<Project>(project);
    const [projectTasks, setProjectTasks] = useState<Task[]>((project.tasks ?? []) as Task[]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const fetchAnalytics = async () => {
            if (!projectId) return;
            setLoading(true);
            try {
                const [freshProject, freshTasks] = await Promise.all([
                    projectService.getProjectById(Number(projectId)),
                    taskService.getTasksByProjectId(Number(projectId)),
                ]);
                if (active && freshProject) {
                    setAnalyticsProject(freshProject);
                    const normalizedTasks = Array.isArray(freshTasks)
                        ? freshTasks
                        : (freshTasks as { tasks?: Task[] })?.tasks ?? [];
                    setProjectTasks(normalizedTasks);
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to load project analytics", err);
                if (active) {
                    setAnalyticsProject(project);
                    setProjectTasks((project.tasks ?? []) as Task[]);
                    setError("Không thể tải dữ liệu dự án mới nhất. Hiển thị thông tin hiện có.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        // Always attempt to fetch to ensure relationships are populated
        fetchAnalytics();
        return () => {
            active = false;
        };
    }, [project, projectId]);

    const tasks = projectTasks;
    const members = analyticsProject.members ?? [];

    const summary = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((task) => task.status === "done").length;
        const inProgress = tasks.filter((task) => task.status === "in_progress").length;
        const review = tasks.filter((task) => task.status === "review").length;
        const blocked = tasks.filter((task) => task.status === "cancelled").length;
        const toDo = tasks.filter((task) => task.status === "to_do").length;
        const overdue = tasks.filter((task) => {
            const remaining = daysUntil(task.dueDate);
            return remaining !== null && remaining < 0 && task.status !== "done";
        }).length;

        const completion = total ? Math.round((done / total) * 100) : 0;

        return {
            total,
            done,
            inProgress,
            review,
            blocked,
            toDo,
            overdue,
            completion,
        };
    }, [tasks]);

    const timeline = useMemo(() => {
        const durationDays = daysBetween(analyticsProject.startDate, analyticsProject.endDate);
        const remainingDays = daysUntil(analyticsProject.endDate);
        return {
            durationDays,
            remainingDays,
            start: formatDate(analyticsProject.startDate),
            end: formatDate(analyticsProject.endDate),
        };
    }, [analyticsProject.endDate, analyticsProject.startDate]);

    const upcomingTasks = useMemo(() => {
        return tasks
            .filter((task) => task.status !== "done")
            .filter((task) => {
                const diff = daysUntil(task.dueDate);
                return diff !== null && diff <= 10;
            })
            .sort((a, b) => (daysUntil(a.dueDate) ?? 9999) - (daysUntil(b.dueDate) ?? 9999))
            .slice(0, 4);
    }, [tasks]);

    const statusBreakdown = useMemo(() => {
        const map: Array<{ key: Task["status"]; count: number; accent: string }> = [
            { key: "to_do", count: 0, accent: "bg-slate-400" },
            { key: "in_progress", count: 0, accent: "bg-sky-400" },
            { key: "review", count: 0, accent: "bg-indigo-400" },
            { key: "done", count: 0, accent: "bg-emerald-500" },
            { key: "cancelled", count: 0, accent: "bg-rose-400" },
        ];
        tasks.forEach((task) => {
            const bucket = map.find((item) => item.key === task.status);
            if (bucket) bucket.count += 1;
        });
        return map;
    }, [tasks]);

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Project</p>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{analyticsProject.name}</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                            {analyticsProject.description || "No description provided for this project."}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-300">
                        <div>
                            <p className="uppercase text-[10px] tracking-widest text-slate-400">Start</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{timeline.start}</p>
                        </div>
                        <div>
                            <p className="uppercase text-[10px] tracking-widest text-slate-400">End</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{timeline.end}</p>
                        </div>
                        <div>
                            <p className="uppercase text-[10px] tracking-widest text-slate-400">Members</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{members.length}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                            Completion
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{summary.completion}%</p>
                        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                                style={{ width: `${summary.completion}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {summary.done}/{summary.total || 0} tasks done
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                            Active tasks
                            <ListChecks className="h-4 w-4 text-sky-500" />
                        </div>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{summary.toDo + summary.inProgress + summary.review}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {summary.inProgress} building · {summary.review} in review
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                            Overdue
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                        </div>
                        <p className={`mt-3 text-3xl font-semibold ${summary.overdue ? "text-rose-500" : "text-slate-900 dark:text-white"}`}>
                            {summary.overdue}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Escalate blockers early.</p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                            Squad size
                            <Users className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{members.length}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{analyticsProject.status?.replace("_", " ") ?? "status"}</p>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-400">Task pipeline</p>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Status breakdown</h2>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{summary.total} total tasks</span>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {statusBreakdown.map((bucket) => (
                                <div key={bucket.key} className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{STATUS_LABELS[bucket.key]}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{bucket.count} tasks</p>
                                        </div>
                                        <div className={`h-8 w-8 rounded-full ${bucket.accent}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-400">Upcoming</p>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Deadlines</h2>
                            </div>
                            <CalendarClock className="h-5 w-5 text-slate-400" />
                        </div>
                        {upcomingTasks.length === 0 ? (
                            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No deadlines in the next 10 days.</p>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {upcomingTasks.map((task) => (
                                    <div key={task.id} className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">{task.title}</p>
                                            <span className={`text-xs font-semibold ${(() => {
                                                const remaining = daysUntil(task.dueDate);
                                                if (remaining === null) return "text-slate-500";
                                                if (remaining < 0) return "text-rose-500";
                                                if (remaining <= 2) return "text-amber-500";
                                                return "text-slate-500";
                                            })()}`}>
                                                {(() => {
                                                    const remaining = daysUntil(task.dueDate);
                                                    if (remaining === null) return "No due date";
                                                    if (remaining < 0) return `${Math.abs(remaining)}d late`;
                                                    if (remaining === 0) return "Due today";
                                                    return `Due in ${remaining}d`;
                                                })()}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                            {task.description || "No description provided."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
                        <p className="text-xs font-semibold uppercase text-slate-400">Timeline</p>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Schedule health</h2>
                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                <span>Duration</span>
                                <span>{timeline.durationDays ? `${timeline.durationDays} days` : "—"}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                <span>Time remaining</span>
                                <span>
                                    {timeline.remainingDays === null
                                        ? "—"
                                        : timeline.remainingDays < 0
                                            ? `${Math.abs(timeline.remainingDays)}d past due`
                                            : `${timeline.remainingDays}d left`}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className={`h-full rounded-full ${timeline.remainingDays !== null && timeline.remainingDays < 0 ? "bg-rose-500" : "bg-sky-500"}`}
                                style={{
                                    width: `${(() => {
                                        const elapsed = daysBetween(analyticsProject.startDate, new Date().toISOString());
                                        const total = daysBetween(analyticsProject.startDate, analyticsProject.endDate);
                                        if (elapsed === null || total === null || total <= 0) return 0;
                                        return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
                                    })()}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
                        <p className="text-xs font-semibold uppercase text-slate-400">Risks</p>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Attention list</h2>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            <li className="flex items-center gap-3">
                                <AlertTriangle className={`h-4 w-4 ${summary.overdue ? "text-rose-500" : "text-slate-400"}`} />
                                {summary.overdue ? `${summary.overdue} overdue tasks need escalation.` : "No overdue tasks."}
                            </li>
                            <li className="flex items-center gap-3">
                                <CalendarClock className="h-4 w-4 text-slate-400" />
                                {timeline.remainingDays !== null && timeline.remainingDays < 0
                                    ? "Project end date has passed."
                                    : timeline.remainingDays !== null
                                        ? `Ends in ${timeline.remainingDays} days.`
                                        : "End date not set."}
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            {error && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    {error}
                </div>
            )}
            {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-sky-500" />
                    Syncing latest stats…
                </div>
            )}
        </div>
    );
}
