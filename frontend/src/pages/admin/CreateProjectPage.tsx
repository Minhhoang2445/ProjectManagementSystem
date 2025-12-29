import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectService } from "@/services/projectService";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import ProjectNavBar from "@/components/project/ProjectNavBar";
import { useState } from "react";
import UserPickerModal from "@/components/project/UserPickerModal";
import type { User } from "@/types/User";
import type { MemberUI } from "@/types/Project";


const statusSchema = z.enum(["planned", "in_progress", "completed", "cancelled"]);

const projectCreateSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
        status: statusSchema,
    })
    .superRefine((data, ctx) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            ctx.addIssue({
                code: "custom",
                path: ["startDate"],
                message: "Invalid date format",
            });
            return;
        }

        if (start > end) {
            ctx.addIssue({
                code: "custom",
                path: ["endDate"],
                message: "End date must be after start date",
            });
        }
    });

type ProjectCreateForm = z.infer<typeof projectCreateSchema>;

export default function ProjectCreatePage() {
    const navigate = useNavigate();
    const [members, setMembers] = useState<MemberUI[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const { register, handleSubmit, formState: { errors } } =
        useForm<ProjectCreateForm>({
            resolver: zodResolver(projectCreateSchema),
            defaultValues: {
                status: "planned",
            },
        });

    // Add users
    const handleSelectUser = (selectedUsers: User[]) => {
        const newMembers = selectedUsers
            .filter(u => !members.some(m => m.userId === Number(u.id)))
            .map((u) => ({
                userId: Number(u.id),
                role: "member" as const,
                user: u
            }));

        setMembers(prev => [...prev, ...newMembers]);
        setModalOpen(false);
    };

    // Submit
    const onSubmit = async (data: ProjectCreateForm) => {
        if (members.length === 0) {
            toast.error("Project must have at least 1 member");
            return;
        }

        try {
            await projectService.create(
                data.name,
                data.description,
                data.startDate,
                data.endDate,
                data.status,
                members
            );

            toast.success("Project created successfully!");
            navigate("/admin/projects");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create project");
        }
    };

    return (
        <div className="w-full space-y-4 text-slate-900">
            <ProjectNavBar />

            <div className="mx-auto px-4">
                <div className="mx-auto rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl">
                    <h2 className="mb-8 text-3xl font-bold text-slate-900">
                        Create New Project
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-2">
                            <label className="font-semibold text-slate-700">Project Name</label>
                            <input
                                {...register("name")}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 shadow-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                                placeholder="Enter project name..."
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="font-semibold text-slate-700">Description</label>
                            <textarea
                                {...register("description")}
                                className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 shadow-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                                placeholder="Describe the project..."
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="font-semibold text-slate-700">Start Date</label>
                                <input
                                    type="date"
                                    {...register("startDate")}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 shadow-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="font-semibold text-slate-700">End Date</label>
                                <input
                                    type="date"
                                    {...register("endDate")}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 shadow-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                                {errors.endDate && (
                                    <p className="text-sm text-red-500">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-semibold text-slate-700">Status</label>
                            <select
                                {...register("status")}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 shadow-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {errors.status && (
                                <p className="text-sm text-red-500">{errors.status.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[15px] font-semibold text-slate-700">Project Members</label>

                            {members.length === 0 && (
                                <p className="text-sm italic text-slate-500">
                                    No members selected. Click "Add Members" to begin.
                                </p>
                            )}

                            <div className="space-y-3">
                                {members.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 font-bold text-white shadow">
                                                {m.user.firstName[0]}
                                            </div>

                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {m.user.firstName} {m.user.lastName}
                                                </p>
                                                <p className="text-xs text-slate-500">{m.user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <select
                                                value={m.role}
                                                onChange={(e) => {
                                                    const newRole = e.target.value as "member" | "project_leader";
                                                    setMembers(prev =>
                                                        prev.map((mem, idx) =>
                                                            idx === i ? { ...mem, role: newRole } : mem
                                                        )
                                                    );
                                                }}
                                                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium shadow-sm"
                                            >
                                                <option value="member">Member</option>
                                                <option value="project_leader">Leader</option>
                                            </select>

                                            <button
                                                onClick={() => setMembers(prev => prev.filter((_, idx) => idx !== i))}
                                                className="text-red-500 transition hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 font-medium text-white shadow transition hover:opacity-90"
                            >
                                + Add Members
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow transition hover:opacity-90"
                        >
                            Create Project
                        </button>
                    </form>
                </div>
            </div>

            <UserPickerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelectUser}
            />
        </div>
    );
}
