import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Loader2, RefreshCcw, UsersRound } from "lucide-react";
import { projectService } from "@/services/projectService";
import type { MemberUI } from "@/types/Project";

type ProjectMembersProps = {
    projectId?: number;
};

const ROLE_BADGES: Record<MemberUI["role"], string> = {
    project_leader:
        "bg-amber-100/70 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
    member:
        "bg-blue-100/60 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/30",
};

export default function ProjectMembers({ projectId: projectIdProp }: ProjectMembersProps) {
    const { projectId: projectIdFromRoute } = useParams();
    const resolvedProjectId = projectIdProp ?? (projectIdFromRoute ? Number(projectIdFromRoute) : undefined);

    const [members, setMembers] = useState<MemberUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const normalizeMembers = (rawMembers: any[] | undefined | null): MemberUI[] => {
        if (!Array.isArray(rawMembers)) return [];
        return rawMembers
            .map((member) => {
                const user = member.user ?? member;
                if (!user) return null;
                return {
                    userId: Number(member.userId ?? user.id),
                    role: (member.roleInProject ?? member.role ?? "member") as MemberUI["role"],
                    user: {
                        ...user,
                        firstName: user.firstName ?? "Unknown",
                        lastName: user.lastName ?? "",
                        email: user.email ?? "",
                    },
                } satisfies MemberUI;
            })
            .filter(Boolean) as MemberUI[];
    };

    const fetchMembers = useCallback(async () => {
        if (!resolvedProjectId) return;
        setLoading(true);
        try {
            const project = await projectService.getProjectById(resolvedProjectId);
            setMembers(normalizeMembers(project?.members));
            setError(null);
        } catch (err) {
            console.error("Failed to load project members", err);
            setError("Không thể tải danh sách thành viên từ API.");
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [resolvedProjectId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const { leaders, teammates } = useMemo(() => {
        return {
            leaders: members.filter((m) => m.role === "project_leader"),
            teammates: members.filter((m) => m.role === "member"),
        };
    }, [members]);

    const total = members.length;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Delivery team
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Team Members</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {total ? `${total} collaborators assigned to this project.` : "No members assigned yet."}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <UsersRound className="h-5 w-5" />
                    <span>{leaders.length} leads · {teammates.length} members</span>
                    <button
                        onClick={fetchMembers}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-200"
                    >
                        <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                            <div className="mb-3 h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="h-3 w-48 rounded bg-slate-100 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            ) : total === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No members have been assigned. Use the project settings to invite collaborators.
                </div>
            ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {members.map((member) => (
                        <article
                            key={member.userId}
                            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-blue-200 hover:shadow dark:border-slate-700 dark:bg-slate-900/70"
                        >
                            {member.user.avatar ? (
                                <img
                                    src={member.user.avatar.startsWith("http") ? member.user.avatar : `http://localhost:5000${member.user.avatar}`}
                                    alt={`${member.user.firstName} ${member.user.lastName}`}
                                    className="h-12 w-12 rounded-full border border-white object-cover shadow"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-base font-semibold text-white shadow">
                                    {(member.user.firstName?.[0] ?? "?").toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {member.user.firstName} {member.user.lastName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{member.user.email}</p>
                                <span
                                    className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROLE_BADGES[member.role]}`}
                                >
                                    {member.role === "project_leader" ? "Project Lead" : "Member"}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
