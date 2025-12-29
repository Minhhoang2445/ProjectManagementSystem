import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    FolderKanban,
    Layers3,
    RefreshCcw,
} from "lucide-react";
import { projectService } from "@/services/projectService";
import type { Project } from "@/types/Project";

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(parsed);
};

const daysBetween = (from?: string | null, to?: string | null) => {
    if (!from || !to) return null;
    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const daysUntil = (target?: string | null) => {
    if (!target) return null;
    const date = new Date(target);
    if (Number.isNaN(date.getTime())) return null;
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const STATUS_LABELS: Record<Project["status"], string> = {
    planned: "Planned",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

const STATUS_BADGES: Record<Project["status"], string> = {
    planned: "border border-slate-200 bg-slate-50 text-slate-700",
    in_progress: "border border-blue-200 bg-blue-50 text-blue-700",
    completed: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelled: "border border-rose-200 bg-rose-50 text-rose-700",
};

const normalizeProjects = (payload: unknown): Project[] => {
    if (Array.isArray(payload)) return payload as Project[];
    if (payload && typeof payload === "object" && Array.isArray((payload as { projects?: Project[] }).projects)) {
        return (payload as { projects?: Project[] }).projects ?? [];
    }
    return [];
};

export default function ProjectPortfolioOverview() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const payload = await projectService.getAll();
            setProjects(normalizeProjects(payload));
            setError(null);
        } catch (err) {
            console.error("Failed to load portfolio overview", err);
            setError("Unable to load project portfolio. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const summary = useMemo(() => {
        const total = projects.length;
        const planned = projects.filter((p) => p.status === "planned").length;
        const active = projects.filter((p) => p.status === "in_progress").length;
        const completed = projects.filter((p) => p.status === "completed").length;
        const cancelled = projects.filter((p) => p.status === "cancelled").length;
        const overdue = projects.filter((p) => {
            const remaining = daysUntil(p.endDate);
            return remaining !== null && remaining < 0 && p.status !== "completed";
        }).length;
        const endingSoon = projects.filter((p) => {
            const remaining = daysUntil(p.endDate);
            return remaining !== null && remaining >= 0 && remaining <= 7 && p.status !== "completed";
        }).length;
        const durations = projects
            .map((p) => daysBetween(p.startDate, p.endDate))
            .filter((value): value is number => value !== null && Number.isFinite(value));
        const averageDuration = durations.length
            ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
            : null;

        return {
            total,
            planned,
            active,
            completed,
            cancelled,
            overdue,
            endingSoon,
            averageDuration,
        };
    }, [projects]);

    const statusBreakdown = useMemo(() => {
        const buckets = (Object.keys(STATUS_LABELS) as Array<Project["status"]>).map((status) => {
            const count = projects.filter((p) => p.status === status).length;
            return { status, count, label: STATUS_LABELS[status] };
        });
        const max = Math.max(...buckets.map((b) => b.count), 1);
        return { buckets, max };
    }, [projects]);

    const upcomingProjects = useMemo(() => {
        return projects
            .filter((project) => project.endDate)
            .map((project) => {
                return { project, remaining: daysUntil(project.endDate) };
            })
            .filter((item) => item.remaining !== null)
            .sort((a, b) => (a.remaining ?? 0) - (b.remaining ?? 0))
            .slice(0, 5);
    }, [projects]);

    return (
        <section className="mx-4 space-y-6 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Portfolio</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Projects overview</h2>
                    <p className="text-sm text-slate-500">
                        Tracking {summary.total} initiatives across the organisation.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadProjects}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
                    >
                        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <Link
                        to="/admin/projects/create"
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                    >
                        + New project
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-32 animate-pulse rounded-xl border border-slate-100 bg-slate-50/80" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
                    No projects to display yet. Start by creating your first project above.
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                                Total projects
                                <Layers3 className="h-4 w-4 text-slate-400" />
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.total}</p>
                            <p className="text-xs text-slate-500">{summary.planned} planned · {summary.active} active</p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                                Active delivery
                                <FolderKanban className="h-4 w-4 text-blue-500" />
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-blue-600">{summary.active}</p>
                            <p className="text-xs text-slate-500">{summary.endingSoon} ending within 7 days</p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                                Completed
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-emerald-600">{summary.completed}</p>
                            <p className="text-xs text-slate-500">{summary.cancelled} cancelled overall</p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                                Risk watch
                                <AlertTriangle className={`h-4 w-4 ${summary.overdue ? "text-rose-500" : "text-slate-400"}`} />
                            </div>
                            <p className={`mt-3 text-3xl font-semibold ${summary.overdue ? "text-rose-500" : "text-slate-900"}`}>
                                {summary.overdue}
                            </p>
                            <p className="text-xs text-slate-500">Projects past due date</p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">Status distribution</p>
                                    <h3 className="text-lg font-semibold text-slate-900">Delivery pipeline</h3>
                                </div>
                                <span className="text-xs text-slate-500">{summary.total} total</span>
                            </div>
                            <div className="mt-5 space-y-4">
                                {statusBreakdown.buckets.map((bucket) => (
                                    <div key={bucket.status}>
                                        <div className="flex items-center justify-between text-sm text-slate-600">
                                            <span>{bucket.label}</span>
                                            <span>{bucket.count}</span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                                                style={{ width: `${Math.max(6, (bucket.count / statusBreakdown.max) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 rounded-xl border border-slate-100 bg-white/95 p-4 text-sm text-slate-600">
                                <p>
                                    Average delivery duration:
                                    <span className="font-semibold text-slate-900">
                                        {summary.averageDuration ? ` ${summary.averageDuration} days` : " not enough data"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">Schedule</p>
                                    <h3 className="text-lg font-semibold text-slate-900">Upcoming deadlines</h3>
                                </div>
                                <CalendarClock className="h-5 w-5 text-slate-400" />
                            </div>
                            {upcomingProjects.length === 0 ? (
                                <p className="mt-6 text-sm text-slate-500">No projects have upcoming end dates.</p>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    {upcomingProjects.map(({ project, remaining }) => (
                                        <div key={project.id} className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                                            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                                                <span className="line-clamp-1">{project.name}</span>
                                                <span className={`text-xs ${remaining !== null && remaining < 0 ? "text-rose-500" : "text-slate-500"}`}>
                                                    {remaining === null
                                                        ? "No date"
                                                        : remaining < 0
                                                            ? `${Math.abs(remaining)}d late`
                                                            : remaining === 0
                                                                ? "Due today"
                                                                : `Due in ${remaining}d`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">Target: {formatDate(project.endDate)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-400">Portfolio list</p>
                                <h3 className="text-lg font-semibold text-slate-900">Recently updated</h3>
                            </div>
                        </div>
                        <div className="mt-4 divide-y divide-slate-100">
                            {projects.slice(0, 6).map((project) => (
                                <div key={project.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                                    <div className="flex-1 min-w-[180px]">
                                        <p className="font-semibold text-slate-900">{project.name}</p>
                                        <p className="text-xs text-slate-500">{project.description || "No description"}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <CalendarClock className="h-4 w-4" />
                                        <span>{formatDate(project.endDate)}</span>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STATUS_BADGES[project.status]}`}>
                                        {STATUS_LABELS[project.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {projects.length > 6 && (
                            <p className="mt-3 text-xs text-slate-500">Showing 6 of {projects.length} projects.</p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
