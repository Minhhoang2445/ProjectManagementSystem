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


const projectCreateSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
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
        <div className="space-y-4 w-full">
            <ProjectNavBar />

            <div className="px-4 mx-auto">
                <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200  mx-auto">

                    {/* TITLE */}
                    <h2 className="text-3xl font-bold mb-8 text-gray-800">
                        Create New Project
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* NAME */}
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700">Project Name</label>
                            <input
                                {...register("name")}
                                className="border p-3 rounded-xl w-full shadow-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-300 outline-none transition"
                                placeholder="Enter project name..."
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>

                        {/* DESCRIPTION */}
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700">Description</label>
                            <textarea
                                {...register("description")}
                                className="border p-3 rounded-xl w-full h-32 resize-none shadow-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-300 outline-none transition"
                                placeholder="Describe the project..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm">{errors.description.message}</p>
                            )}
                        </div>

                        {/* DATES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-semibold text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    {...register("startDate")}
                                    className="border p-3 rounded-xl w-full shadow-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-300 outline-none transition"
                                />
                                {errors.startDate && (
                                    <p className="text-red-500 text-sm">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="font-semibold text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    {...register("endDate")}
                                    className="border p-3 rounded-xl w-full shadow-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-300 outline-none transition"
                                />
                                {errors.endDate && (
                                    <p className="text-red-500 text-sm">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>

                        {/* MEMBERS */}
                        <div className="space-y-4">
                            <label className="font-semibold text-gray-700 text-[15px]">Project Members</label>

                            {members.length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                    No members selected. Click "Add Members" to begin.
                                </p>
                            )}

                            <div className="space-y-3">
                                {members.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                                    >
                                        {/* USER INFO */}
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center shadow">
                                                {m.user.firstName[0]}
                                            </div>

                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {m.user.firstName} {m.user.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">{m.user.email}</p>
                                            </div>
                                        </div>

                                        {/* ROLE + REMOVE */}
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
                                                className="border px-3 py-1.5 rounded-lg bg-gray-50 text-sm font-medium shadow-sm"
                                            >
                                                <option value="member">Member</option>
                                                <option value="project_leader">Leader</option>
                                            </select>

                                            <button
                                                onClick={() => setMembers(prev => prev.filter((_, idx) => idx !== i))}
                                                className="text-red-500 hover:text-red-700 transition"
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
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:opacity-90 transition font-medium"
                            >
                                + Add Members
                            </button>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow hover:opacity-90 transition"
                        >
                            Create Project
                        </button>
                    </form>
                </div>
            </div>

            {/* MODAL */}
            <UserPickerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelectUser}
            />
        </div>
    );
}
