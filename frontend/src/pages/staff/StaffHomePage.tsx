import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Kanban,
  Layers3,
  ListChecks,
  Loader2,
  RefreshCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { useAuthStore } from "@/store/useAuthStore";
import type { Task } from "@/types/Task";
import type { Project } from "@/types/Project";

type BoardStatus = Extract<Task["status"], "todo" | "in_progress" | "review" | "done">;

const BOARD_COLUMNS: Array<{
  key: BoardStatus;
  label: string;
  gradient: string;
  chip: string;
  border: string;
}> = [
  {
    key: "todo",
    label: "Plan",
    gradient: "from-slate-900/90 via-slate-900/80 to-slate-900/40",
    chip: "bg-slate-800/70",
    border: "border-slate-800/60",
  },
  {
    key: "in_progress",
    label: "Build",
    gradient: "from-sky-900 via-sky-900/80 to-slate-900/40",
    chip: "bg-sky-900/60",
    border: "border-sky-800/60",
  },
  {
    key: "review",
    label: "Review",
    gradient: "from-indigo-900 via-indigo-900/80 to-slate-900/40",
    chip: "bg-indigo-900/60",
    border: "border-indigo-800/60",
  },
  {
    key: "done",
    label: "Done",
    gradient: "from-emerald-900 via-emerald-900/80 to-slate-900/40",
    chip: "bg-emerald-900/60",
    border: "border-emerald-800/60",
  },
];

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  low: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  medium: "border border-amber-500/40 bg-amber-500/10 text-amber-500",
  high: "border border-orange-500/40 bg-orange-500/10 text-orange-500",
  urgent: "border border-rose-500/40 bg-rose-500/10 text-rose-500",
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const daysUntil = (value?: string | null) => {
  const date = parseDate(value);
  if (!date) return null;
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const isDueSoon = (value?: string | null, windowInDays = 5) => {
  const diff = daysUntil(value);
  return diff !== null && diff >= 0 && diff <= windowInDays;
};

const isOverdue = (value?: string | null) => {
  const diff = daysUntil(value);
  return diff !== null && diff < 0;
};

const isWithinLastDays = (value?: string | null, windowInDays = 7) => {
  const date = parseDate(value);
  if (!date) return false;
  const diff = Date.now() - date.getTime();
  return diff >= 0 && diff <= windowInDays * 24 * 60 * 60 * 1000;
};

const formatShortDate = (value?: string | null) => {
  const date = parseDate(value);
  if (!date) return "No due date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const formatRelativeLabel = (value?: string | null) => {
  const diff = daysUntil(value);
  if (diff === null) return "No due date";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  return `Due in ${diff}d`;
};

const resolveProjectId = (task: Task) => {
  const fallback = (task as any)?.project?.id ?? (task as any)?.project?.projectId;
  const raw = task.projectId ?? fallback;
  const normalized = Number(raw);
  return Number.isNaN(normalized) ? null : normalized;
};

export default function StaffHomePage() {
  const { user, fetchUser } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!useAuthStore.getState().user) {
      await fetchUser();
    }

    const [taskPayload, projectPayload] = await Promise.all([
      taskService.getUserTasks(),
      projectService.getUserProjects(),
    ]);

    return {
      tasks: Array.isArray(taskPayload)
        ? taskPayload
        : (taskPayload as { tasks?: Task[] })?.tasks ?? [],
      projects: Array.isArray(projectPayload)
        ? projectPayload
        : (projectPayload as { projects?: Project[] })?.projects ?? [],
    };
  }, [fetchUser]);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      setIsBootstrapping(true);
      try {
        const data = await fetchDashboardData();
        if (!active) return;
        setTasks(data.tasks);
        setProjects(data.projects);
        setError(null);
      } catch (err) {
        console.error("Failed to load staff dashboard", err);
        if (active) {
          setError("Không thể tải dữ liệu dashboard từ API backend.");
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, [fetchDashboardData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchDashboardData();
      setTasks(data.tasks);
      setProjects(data.projects);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh staff dashboard", err);
      setError("Không thể làm mới dữ liệu ngay bây giờ.");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchDashboardData]);

  const projectNameLookup = useMemo(() => {
    const map = new Map<number, string>();
    projects.forEach((project) => map.set(project.id, project.name));
    return map;
  }, [projects]);

  const workloadSnapshot = useMemo(() => {
    const open = tasks.filter(
      (task) => task.status !== "done" && task.status !== "cancelled"
    ).length;
    const dueSoonCount = tasks.filter((task) => isDueSoon(task.dueDate, 7)).length;
    const overdue = tasks.filter((task) => isOverdue(task.dueDate)).length;
    const velocity = tasks.filter(
      (task) => task.status === "done" && isWithinLastDays(task.updatedAt, 7)
    ).length;
    const blocked = tasks.filter((task) => task.status === "cancelled").length;

    return {
      open,
      dueSoon: dueSoonCount,
      overdue,
      velocity,
      blocked,
    };
  }, [tasks]);

  const upcomingFocus = useMemo(() => {
    return tasks
      .filter((task) => task.status !== "done")
      .filter((task) => isOverdue(task.dueDate) || isDueSoon(task.dueDate, 14))
      .sort((a, b) => {
        const diffA = daysUntil(a.dueDate) ?? Number.POSITIVE_INFINITY;
        const diffB = daysUntil(b.dueDate) ?? Number.POSITIVE_INFINITY;
        return diffA - diffB;
      })
      .slice(0, 6);
  }, [tasks]);

  const priorityQueue = useMemo(() => {
    return tasks
      .filter((task) => task.priority === "urgent" || task.priority === "high")
      .sort((a, b) => {
        const diffA = daysUntil(a.dueDate) ?? Number.POSITIVE_INFINITY;
        const diffB = daysUntil(b.dueDate) ?? Number.POSITIVE_INFINITY;
        return diffA - diffB;
      })
      .slice(0, 5);
  }, [tasks]);

  const projectSnapshots = useMemo(() => {
    return projects
      .map((project) => {
        const normalizedProjectId = Number(project.id);
        const scopedTasks = tasks.filter(
          (task) => resolveProjectId(task) === normalizedProjectId
        );
        const done = scopedTasks.filter((task) => task.status === "done").length;
        const total = scopedTasks.length;
        const progress = total ? Math.round((done / total) * 100) : 0;
        const inProgress = scopedTasks.filter(
          (task) => task.status === "in_progress"
        ).length;
        const blockers = scopedTasks.filter((task) => task.status === "cancelled").length;
        console.log({ project, scopedTasks, done, total, progress, inProgress, blockers });
        return {
          project,
          total,
          done,
          progress,
          inProgress,
          blockers,
        };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [projects, tasks]);

  const boardColumns = useMemo(() => {
    return BOARD_COLUMNS.map((column) => {
      const columnTasks = tasks
        .filter((task) => task.status === column.key)
        .sort((a, b) => {
          const diffA = daysUntil(a.dueDate) ?? Number.POSITIVE_INFINITY;
          const diffB = daysUntil(b.dueDate) ?? Number.POSITIVE_INFINITY;
          return diffA - diffB;
        });

      return {
        ...column,
        tasks: columnTasks,
      };
    });
  }, [tasks]);

  const emptyState = !isBootstrapping && tasks.length === 0 && projects.length === 0;

  return (
    <div className="space-y-8 p-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 text-white">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            
            <h1 className="mt-2 text-3xl font-semibold">
              {user ? `Hi ${user.firstName},` : "Team Radar"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              {workloadSnapshot.dueSoon > 0
                ? `${workloadSnapshot.dueSoon} tasks need attention this week. Keep momentum by closing blockers early.`
                : "Everything looks calm. Use this window to tackle strategic backlog items."}
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-300 md:text-right">
            <div className="flex items-center gap-3 md:justify-end">
              <Sparkles className="size-4 text-amber-400" />
              <span>
                {tasks.length} tasks across {projects.length} spaces
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white"
                disabled={isRefreshing}
              >
                <RefreshCcw
                  className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh data
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-40">
          <div className="absolute bottom-[-40%] right-[-10%] h-[400px] w-[400px] rounded-full bg-sky-500 blur-[160px]" />
          <div className="absolute top-[-20%] right-[5%] h-[280px] w-[280px] rounded-full bg-indigo-500 blur-[120px]" />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            Active Workload
            <ListChecks className="size-4 text-slate-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-semibold text-slate-900">
              {workloadSnapshot.open}
            </span>
            <p className="text-xs text-slate-500">
              of {tasks.length} total tasks
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{
                width: `${tasks.length === 0 ? 0 : Math.min(100, (workloadSnapshot.open / tasks.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            Due Soon
            <CalendarClock className="size-4 text-slate-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-semibold text-slate-900">
              {workloadSnapshot.dueSoon}
            </span>
            <p className="text-xs text-slate-500">within 7 days</p>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {workloadSnapshot.overdue} already overdue
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            Velocity
            <TrendingUp className="size-4 text-slate-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-semibold text-slate-900">
              {workloadSnapshot.velocity}
            </span>
            <p className="text-xs text-slate-500">completed this week</p>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Track trend in retrospectives
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            Blockers
            <AlertTriangle className="size-4 text-rose-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-semibold text-slate-900">
              {workloadSnapshot.blocked}
            </span>
            <p className="text-xs text-slate-500">cancelled / stalled</p>
          </div>
          <p className="mt-2 text-xs text-rose-500">
            Escalate early to keep flow healthy
          </p>
        </div>
      </section>

      {isBootstrapping ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
          <Loader2 className="mx-auto mb-3 size-6 animate-spin text-slate-400" />
          Syncing live data from the backend...
        </div>
      ) : (
        <>
          {emptyState ? (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-10 text-center text-sm text-slate-500">
              No assigned tasks or projects yet. Once backend assigns you workspaces, this dashboard will populate automatically.
            </div>
          ) : (
            <>
              <section className="grid gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Upcoming delivery
                        </p>
                        <h2 className="text-xl font-semibold text-slate-900">
                          Due in the next two weeks
                        </h2>
                      </div>
                      <CalendarClock className="size-5 text-slate-400" />
                    </div>
                    <div className="mt-5 space-y-4">
                      {upcomingFocus.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No imminent deadlines. Review backlog to pull work forward.
                        </p>
                      )}
                      {upcomingFocus.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PRIORITY_STYLES[task.priority]}`}>
                              {task.priority}
                            </span>
                            <p className="text-sm font-medium text-slate-900">
                              {task.title}
                            </p>
                            <span className="text-xs text-slate-400">
                              {(() => {
                                const pid = resolveProjectId(task);
                                return pid ? projectNameLookup.get(pid) ?? `Project #${pid}` : "Unknown project";
                              })()}
                            </span>
                            <span
                              className={`ml-auto text-xs font-medium ${isOverdue(task.dueDate) ? "text-rose-500" : "text-slate-500"}`}
                            >
                              {formatRelativeLabel(task.dueDate)}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                            {task.description || "No description provided."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Priority queue
                        </p>
                        <h2 className="text-xl font-semibold text-slate-900">
                          High leverage tickets
                        </h2>
                      </div>
                      <Layers3 className="size-5 text-slate-400" />
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {priorityQueue.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No high priority tickets assigned.
                        </p>
                      )}
                      {priorityQueue.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-slate-900/5 p-2">
                              <Kanban className="size-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {task.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatShortDate(task.dueDate)} · {formatRelativeLabel(task.dueDate)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {(() => {
                                const pid = resolveProjectId(task);
                                return pid ? projectNameLookup.get(pid) ?? `Project #${pid}` : "Unknown project";
                              })()}
                            </span>
                            <span className="capitalize">{task.status.replace("_", " ")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Project delivery
                        </p>
                        <h2 className="text-xl font-semibold text-slate-900">
                          Spaces you belong to
                        </h2>
                      </div>
                      <ListChecks className="size-5 text-slate-400" />
                    </div>
                    <div className="mt-5 space-y-4">
                      {projectSnapshots.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No projects assigned.
                        </p>
                      )}
                      {projectSnapshots.map((snapshot) => (
                        <div
                          key={snapshot.project.id}
                          className="rounded-xl border border-slate-100 bg-white/90 p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {snapshot.project.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {snapshot.done}/{snapshot.total || 0} done · {snapshot.inProgress} building
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {snapshot.progress}%
                          
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${snapshot.progress}%` }}
                            />
                            </span>
                          </div>
                          {snapshot.blockers > 0 && (
                            <p className="mt-2 text-xs text-rose-500">
                              {snapshot.blockers} blocked tasks need attention
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Personal kanban
                    </p>
                    
                  </div>
                  <Kanban className="size-6 text-slate-400" />
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-4">
                  {boardColumns.map((column) => (
                    <div
                      key={column.key}
                      className={`rounded-2xl border bg-gradient-to-b p-4 text-white ${column.border} ${column.gradient}`}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide">
                        {column.label}
                        <span className={`rounded-full px-2 py-0.5 text-xs ${column.chip}`}>
                          {column.tasks.length}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {column.tasks.length === 0 && (
                          <p className="text-xs text-white/70">Nothing here yet.</p>
                        )}
                        {column.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-xl border border-white/20 bg-white/5 p-3 text-white/90"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">
                                  {task.title}
                                </p>
                                <p className="text-xs text-white/70 line-clamp-2">
                                  {task.description || "No description"}
                                </p>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_STYLES[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
                              
                              <span>{formatShortDate(task.dueDate)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
