import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2, Paperclip } from "lucide-react";
import type {
  Task,
  CreateTaskFormData,
  ProjectMemberSummary,
} from "@/types/Task";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateTaskFormData | FormData) => Promise<void>;
  projectId: number;
  taskId?: number | null;
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
  projectId,    
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
      assigneeId: undefined,
    },
  });

  const [files, setFiles] = useState<File[]>([]);

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
      setFiles([]);
    }
  }, [isOpen, defaultStatus, reset]);

  const onSubmit = async (data: CreateTaskFormData) => {
    let formattedDate = undefined;
    if (data.dueDate) {
      formattedDate = new Date(data.dueDate).toISOString();
    }

    // 1. Validate & Parse assigneeId manually
    const rawAssigneeId = data.assigneeId;

    const payload = {
      ...data,
      projectId, // Explicitly include projectId
      dueDate: formattedDate,
        assigneeId: (data.assigneeId && !isNaN(Number(data.assigneeId)))
            ? Number(data.assigneeId)
            : undefined,
    };

    // 👉 Nếu có file → dùng FormData
    if (files.length > 0) {
      const formData = new FormData();

      // Append projectId manually to ensure it is present
      formData.append("projectId", String(projectId));

      Object.entries(payload).forEach(([key, value]) => {
        // projectId already added manually
        if (key !== "projectId" && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      files.forEach((file) => {
        formData.append("files", file);
      });

      await onCreate(formData);
    } else {
      await onCreate(payload);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">Create New Task</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              className={inputClass}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select {...register("status")} className={inputClass}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <select {...register("priority")} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assignee *</label>
              <select
                {...register("assigneeId", {
                  required: "Please select an assignee",
                    valueAsNumber: true
                })}
                className={inputClass}
              >
                <option value="">-- Select --</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
              {errors.assigneeId && (
                <p className="text-xs text-red-500">
                  {errors.assigneeId.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                {...register("dueDate")}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Attachments</label>
            <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Paperclip size={16} />
              Select files
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>

            {files.length > 0 && (
              <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                {files.map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
