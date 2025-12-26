import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import type { Task, CreateTaskFormData, ProjectMemberSummary } from "@/types/Task";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateTaskFormData) => Promise<void>;
    projectId: number;
    defaultStatus: Task["status"];
    members: ProjectMemberSummary[];
    isSubmitting: boolean;
}

export default function CreateTaskModal({
    isOpen,
    onClose,
    onCreate,
    defaultStatus,
    members,
    isSubmitting,
}: CreateTaskModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateTaskFormData>({
        defaultValues: {
            title: "",
            description: "",
            status: defaultStatus,
            priority: "medium",
            // assigneeId để undefined hoặc null ban đầu
            assigneeId: undefined,
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                title: "",
                description: "",
                status: defaultStatus,
                priority: "medium",
                assigneeId: undefined,
                dueDate: "",
            });
        }
    }, [isOpen, defaultStatus, reset]);

    const onSubmit = (data: CreateTaskFormData) => {
        let formattedDate = undefined;
        if (data.dueDate) {
            const dateObj = new Date(data.dueDate);
            formattedDate = dateObj.toISOString();
        }

        const formattedData: CreateTaskFormData = {
            ...data,
            assigneeId: (data.assigneeId && !isNaN(Number(data.assigneeId)))
                ? Number(data.assigneeId)
                : undefined,
            dueDate: formattedDate,
        };

        onCreate(formattedData);
    };

    if (!isOpen) return null;

    const inputClass = "mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";
    console.log(members);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl md:max-w-lg">

                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-800">Create New Task</h2>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className={labelClass}>
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                {...register("title", { required: "Title is required" })}
                                className={inputClass}
                                placeholder="e.g., Fix navigation bug"
                            />
                            {errors.title && (
                                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className={labelClass}>Description</label>
                            <textarea
                                id="description"
                                rows={3}
                                {...register("description")}
                                className={inputClass}
                                placeholder="Add more details..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className={labelClass}>Status</label>
                                <select id="status" {...register("status")} className={inputClass}>
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className={labelClass}>Priority</label>
                                <select id="priority" {...register("priority")} className={inputClass}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="assigneeId" className={labelClass}>Assignee</label>
                                <select
                                    id="assigneeId"
                                    {...register("assigneeId", {
                                        valueAsNumber: true
                                    })}
                                    className={inputClass}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map((member) => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.firstName} {member.lastName}

                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="dueDate" className={labelClass}>Due Date</label>
                                <input
                                    id="dueDate"
                                    type="date"
                                    {...register("dueDate")}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}