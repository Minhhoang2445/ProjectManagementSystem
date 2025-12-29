import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { PenSquare, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { projectService } from "@/services/projectService";
import UserPickerModal from "@/components/project/UserPickerModal";
import type { Project } from "@/types/Project";
import type { UpdateProjectPayload } from "@/services/projectService";
import type { User } from "@/types/User";

const PROJECT_STATUS_OPTIONS: Array<{ value: Project["status"]; label: string }> = [
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const formatDateForInput = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

export type ProjectManageControlsProps = {
    project?: Project | null;
    onProjectUpdated?: (project: Project) => void;
};

type EditFormState = {
    name: string;
    description: string;
    status: Project["status"];
    startDate: string;
    endDate: string;
};

export default function ProjectManageControls({ project, onProjectUpdated }: ProjectManageControlsProps) {
    const authUser = useAuthStore((state) => state.user);
    const members = useMemo(() => project?.members ?? [], [project?.members]);

    const canManage = useMemo(() => {
        if (!authUser) return false;
        if (authUser.role === "admin") return true;
        return members.some((member: any) => {
            const memberRole = member.roleInProject ?? member.role;
            return member.userId === authUser.id && memberRole === "project_leader";
        });
    }, [authUser, members]);

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddingMembers, setIsAddingMembers] = useState(false);
    const [editForm, setEditForm] = useState<EditFormState>({
        name: project?.name ?? "",
        description: project?.description ?? "",
        status: project?.status ?? "planned",
        startDate: formatDateForInput(project?.startDate),
        endDate: formatDateForInput(project?.endDate),
    });

    useEffect(() => {
        setEditForm({
            name: project?.name ?? "",
            description: project?.description ?? "",
            status: project?.status ?? "planned",
            startDate: formatDateForInput(project?.startDate),
            endDate: formatDateForInput(project?.endDate),
        });
    }, [project]);

    if (!project?.id || !canManage) {
        return null;
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDetailsSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!project?.id) return;
        setIsSubmitting(true);

        const payload: UpdateProjectPayload = {
            name: editForm.name.trim(),
            description: editForm.description.trim(),
            status: editForm.status,
            startDate: editForm.startDate || undefined,
            endDate: editForm.endDate || undefined,
        };

        try {
            const response = await projectService.update(project.id, payload);
            const updatedProject = response?.project ?? response;
            onProjectUpdated?.(updatedProject as Project);
            toast.success("Cập nhật dự án thành công");
            setIsDetailsModalOpen(false);
        } catch (error) {
            console.error("Failed to update project", error);
            toast.error("Không thể cập nhật dự án");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMembersSelect = async (users: User[]) => {
        if (!users.length || !project?.id) return;
        setIsAddingMembers(true);
        try {
            const response = await projectService.update(project.id, {
                members: users.map((user) => ({ userId: user.id, role: "member" })),
            });
            const updatedProject = response?.project ?? response;
            onProjectUpdated?.(updatedProject as Project);
            toast.success(`${users.length} thành viên đã được thêm`);
        } catch (error) {
            console.error("Failed to add project members", error);
            toast.error("Không thể thêm thành viên mới");
        } finally {
            setIsAddingMembers(false);
        }
    };

    const excludeIds = members.map((member: any) => member.userId ?? member.id).filter(Boolean);

    return (
        <>
            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Collaboration</p>
                        <h2 className="text-xl font-semibold text-slate-900">Admin & leader controls</h2>
                        <p className="text-sm text-slate-500">
                            Update project metadata or invite new teammates without leaving this page.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDetailsModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-600"
                        >
                            <PenSquare className="h-4 w-4" />
                            Update details
                        </button>
                        <button
                            type="button"
                            disabled={isAddingMembers}
                            onClick={() => setIsPickerOpen(true)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                isAddingMembers
                                    ? "border-slate-200 bg-slate-100 text-slate-400"
                                    : "border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:text-emerald-600"
                            }`}
                        >
                            <UserPlus className="h-4 w-4" />
                            {isAddingMembers ? "Updating..." : "Invite members"}
                        </button>
                    </div>
                </div>
            </section>

            {isDetailsModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Edit</p>
                                <h2 className="text-xl font-semibold text-slate-900">Update project details</h2>
                                <p className="text-sm text-slate-500">Make changes without leaving the overview.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleDetailsSubmit} className="mt-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Project name
                                    <input
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-700">
                                    Status
                                    <select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none"
                                    >
                                        {PROJECT_STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label className="text-sm font-semibold text-slate-700">
                                Description
                                <textarea
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none"
                                />
                            </label>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Start date
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={editForm.startDate}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-700">
                                    End date
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={editForm.endDate}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none"
                                    />
                                </label>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
                                        isSubmitting ? "bg-slate-400" : "bg-sky-600 hover:bg-sky-700"
                                    }`}
                                >
                                    {isSubmitting ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <UserPickerModal
                open={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleMembersSelect}
                excludeUserIds={excludeIds}
            />
        </>
    );
}
