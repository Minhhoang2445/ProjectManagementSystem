import { useEffect, useState, useMemo } from "react";
import { useParams, useOutletContext } from "react-router";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Plus, Clock, Paperclip, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/Task";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import type { CreateTaskFormData, ProjectMemberSummary } from "@/types/Task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const COLUMNS = ["todo", "in_progress", "review", "done"] as const;

interface ProjectOutletContext {
    project: any;
    user: any;
    role: string | null;
    isLeader: boolean;
    membersSummary: ProjectMemberSummary[];
}

export default function ProjectKanban() {
    const { projectId } = useParams();
    const { isLeader, membersSummary } = useOutletContext<ProjectOutletContext>();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDefaultStatus, setModalDefaultStatus] = useState<Task["status"]>("to_do");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        if (projectId) {
            loadTasks(Number(projectId));
        }
    }, [projectId]);

    const loadTasks = async (id: number) => {
        try {
            if (tasks.length === 0) setLoading(true);
            const data = await taskService.getTasksByProjectId(id);
            setTasks(data);
        } catch (err) {
            console.error("Failed to load tasks", err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskClick = (taskId: number) => {
        setSelectedTaskId(taskId);
        setIsDetailModalOpen(true);
    };

    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {
            todo: [], in_progress: [], review: [], done: [],
        };
        tasks.forEach((task) => {
            const statusKey = task.status === 'to_do' ? 'todo' : task.status;
            if (groups[statusKey]) groups[statusKey].push(task);
            else if (groups[task.status]) groups[task.status].push(task);
        });
        return groups;
    }, [tasks]);

    const handleOpenCreateModal = (statusColumn: string) => {
        setModalDefaultStatus(statusColumn as Task["status"]);
        setIsModalOpen(true);
    };

    const handleCreateTask = async (formData: any) => {
        if (!projectId) return;
        try {
            setIsCreating(true);
            if (formData instanceof FormData) {
                formData.append("projectId", projectId);
            } else {
                formData.projectId = Number(projectId);
            }
            const response = await taskService.createTask(Number(projectId), formData);
            const newTask = response.task || response;
            if (newTask && newTask.id) {
                setTasks((prev) => [...prev, newTask]);
                toast.success("Tạo công việc thành công!");
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error("Lỗi khi tạo công việc");
        } finally {
            setIsCreating(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskId = Number(draggableId);
        const newStatus = destination.droppableId as Task["status"];

        const newTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTasks(newTasks);

        try {
            // Logic update status API
        } catch (error) {
            loadTasks(Number(projectId));
        }
    };

    // --- HELPER STYLE ---

    // Style Card (Nền + Border)
    const getCardStyle = (priority: string, isDragging: boolean) => {
        // Giảm border-l xuống 4px cho thanh thoát
        let baseStyle = "border-l-4 transition-all duration-200 ease-in-out cursor-pointer group relative select-none";

        if (isDragging) {
            return `${baseStyle} bg-white shadow-2xl ring-2 ring-blue-400 rotate-2 z-50 opacity-90 border-l-blue-400`;
        }

        switch (priority) {
            case 'urgent':
                return `${baseStyle} bg-red-50 border-l-red-600 border border-red-200 hover:shadow-md hover:border-red-300`;
            case 'high':
                return `${baseStyle} bg-white border-l-orange-500 border border-gray-200 hover:shadow-md hover:border-blue-300`;
            case 'medium':
                return `${baseStyle} bg-white border-l-blue-500 border border-gray-200 hover:shadow-md hover:border-blue-300`;
            default:
                return `${baseStyle} bg-white border-l-slate-400 border border-gray-200 hover:shadow-md hover:border-blue-300`;
        }
    };

    // Style Badge Priority
    const getBadgeStyle = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-200 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Check Deadline
    const isOverdue = (task: Task) => {
        if (!task.dueDate) return false;
        const now = new Date();
        const deadline = new Date(task.dueDate);
        now.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        return deadline < now && task.status !== 'done';
    };

    if (loading) return <div className="p-10 text-center text-gray-500 text-sm">Đang tải danh sách công việc...</div>;

    return (
        <div className="mt-6 h-full overflow-x-auto pb-4">
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateTask}
                projectId={Number(projectId)}
                defaultStatus={modalDefaultStatus}
                members={membersSummary || []}
                isSubmitting={isCreating}
            />

            {projectId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    projectId={Number(projectId)}
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedTaskId(null);
                        loadTasks(Number(projectId));
                    }}
                    canEdit={isLeader}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[1000px] md:min-w-0 px-2">
                <DragDropContext onDragEnd={onDragEnd}>
                    {COLUMNS.map((col) => (
                        <Droppable key={col} droppableId={col}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex flex-col rounded-xl bg-gray-50/80 border border-gray-200 shadow-sm h-full max-h-[calc(100vh-180px)] transition-colors
                                        ${snapshot.isDraggingOver ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-100" : ""}
                                    `}
                                >
                                    {/* Header Cột */}
                                    <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">
                                                {col.replace("_", " ")}
                                            </h3>
                                            <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-200">
                                                {groupedTasks[col]?.length || 0}
                                            </span>
                                        </div>
                                        {isLeader && (
                                            <button
                                                onClick={() => handleOpenCreateModal(col)}
                                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Danh sách Task */}
                                    <div className="p-2 flex-1 overflow-y-auto min-h-[150px] space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
                                        {groupedTasks[col]?.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => handleTaskClick(task.id)}
                                                        className={`rounded-lg p-3 shadow-sm 
                                                            ${getCardStyle(task.priority, snapshot.isDragging)}
                                                        `}
                                                    >
                                                        {/* Header Card: Priority & Attachments Summary (Optional positioning) */}
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${getBadgeStyle(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>

                                                        {/* Body: Title - Giảm xuống text-sm (14px) cho vừa vặn */}
                                                        <h4 className={`font-semibold text-sm mb-2 leading-snug line-clamp-3 transition-colors
                                                            ${task.priority === 'urgent' ? 'text-red-950' : 'text-gray-800 group-hover:text-blue-700'}
                                                        `}>
                                                            {task.title}
                                                        </h4>

                                                        {/* Footer: Info */}
                                                        <div className={`flex items-center justify-between mt-2 pt-2 border-t 
                                                            ${task.priority === 'urgent' ? 'border-red-200' : 'border-gray-100'}`}>

                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {/* Attachments - Kiểm tra kỹ mảng attachments */}
                                                                {task.attachments && task.attachments.length > 0 && (
                                                                    <div className={`flex items-center gap-1 text-xs font-medium 
                                                                        ${task.priority === 'urgent' ? 'text-red-600 bg-red-100/50 px-1.5 py-0.5 rounded' : 'text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded'}`}
                                                                        title={`${task.attachments.length} files attached`}
                                                                    >
                                                                        <Paperclip size={13} />
                                                                        <span>{task.attachments.length}</span>
                                                                    </div>
                                                                )}

                                                                {/* Deadline & Overdue Check */}
                                                                {task.dueDate && (
                                                                    <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border transition-colors font-medium
                                                                        ${isOverdue(task)
                                                                            ? 'bg-red-50 text-red-700 border-red-200 font-bold' // Style khi trễ hạn
                                                                            : task.priority === 'urgent'
                                                                                ? 'text-red-800 bg-red-100/30 border-transparent'
                                                                                : 'text-gray-500 bg-gray-50 border-transparent'}`}
                                                                        title={isOverdue(task) ? "Đã trễ hạn!" : "Hạn hoàn thành"}
                                                                    >
                                                                        {isOverdue(task) ? <AlertCircle size={12} /> : <Clock size={12} />}
                                                                        <span>
                                                                            {new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                                        </span>
                                                                        {isOverdue(task) && (
                                                                            <span className="ml-1 text-[9px] bg-red-200 px-1 rounded text-red-800">TRỄ</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Assignee Avatar - Giảm size xuống h-6 w-6 */}
                                                            {task.assignee ? (
                                                                <Avatar className={`h-6 w-6 shadow-sm ${task.priority === 'urgent' ? 'border border-red-200' : 'border border-white'}`}>
                                                                    <AvatarImage src={task.assignee.avatar} />
                                                                    <AvatarFallback className="text-[9px] bg-blue-100 text-blue-700 font-bold">
                                                                        {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center border border-dashed
                                                                    ${task.priority === 'urgent' ? 'bg-red-100 border-red-300 text-red-400' : 'bg-gray-100 border-gray-300 text-gray-400'}`}
                                                                    title="Chưa giao việc"
                                                                >
                                                                    <span className="text-[9px] font-bold">?</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </DragDropContext>
            </div>
        </div>
    );
}