import { useEffect, useState, useMemo } from "react";
import { useParams, useOutletContext } from "react-router";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/Task";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import type { CreateTaskFormData, ProjectMemberSummary } from "@/types/Task";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDefaultStatus, setModalDefaultStatus] = useState<Task["status"]>("to_do");
    const [isCreating, setIsCreating] = useState(false);
    useEffect(() => {
        if (projectId) {
            loadTasks(Number(projectId));
        }
    }, [projectId]);

    const loadTasks = async (id: number) => {
        try {
            setLoading(true);
            const data = await taskService.getTasksByProjectId(id);
            setTasks(data);
        } catch (err) {
            console.error("Failed to load tasks", err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {
            todo: [],
            in_progress: [],
            review: [],
            done: [],
        };

        tasks.forEach((task) => {
            if (groups[task.status]) {
                groups[task.status].push(task);
            }
            if (!groups[task.status]) {
                console.warn(`Mismatch status! Task ID ${task.id} có status là "${task.status}" nhưng bảng chỉ có cột "todo"`);
            }
        });

        return groups;
    }, [tasks]);

    const handleOpenCreateModal = (statusColumn: string) => {
        setModalDefaultStatus(statusColumn as Task["status"]);
        setIsModalOpen(true);
    };

    const handleCreateTask = async (formData: CreateTaskFormData) => {
        if (!projectId) return;

        try {
            setIsCreating(true);
            const payload = {
                ...formData,
                projectId: Number(projectId),
            };

           
            const response = await taskService.createTask(Number(projectId), payload);

           
            const newTask = response.task || response;

            // 3. Cập nhật State
            if (newTask && newTask.id) {
                setTasks((prev) => [...prev, newTask]);
                toast.success("Task created successfully!");
                setIsModalOpen(false);
            } else {
                console.error("Structure mismatch:", response);
                toast.error("Error: Invalid task data received");
            }

        } catch (error) {
            console.error("Failed to create task", error);
            toast.error("Failed to create task");
        } finally {
            setIsCreating(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        console.log("Moved task", draggableId, "to", destination.droppableId);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading tasks...</div>;

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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[1000px] md:min-w-0">
                <DragDropContext onDragEnd={onDragEnd}>
                    {COLUMNS.map((col) => (
                        <Droppable key={col} droppableId={col}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex flex-col rounded-xl border shadow-sm transition-colors max-h-[calc(100vh-200px)]
                                        ${snapshot.isDraggingOver ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}
                                    `}
                                >
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-700 capitalize">
                                                {col.replace("_", " ")}
                                            </h3>
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                                {groupedTasks[col]?.length || 0}
                                            </span>
                                        </div>

                                        {isLeader && (
                                            <button
                                                onClick={() => handleOpenCreateModal(col)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                                title={`Add task to ${col}`}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-3 flex-1 overflow-y-auto min-h-[150px]">
                                        {groupedTasks[col]?.map((task, index) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={task.id.toString()}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p-3 mb-3 bg-white rounded-lg border transition-shadow group
                                                            ${snapshot.isDragging ? "shadow-lg ring-2 ring-blue-400 rotate-2" : "shadow-sm hover:border-blue-300 border-gray-200"}
                                                        `}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider
                                                                ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                                        'bg-green-100 text-green-600'}
                                                            `}>
                                                                {task.priority}
                                                            </span>
                                                        </div>

                                                        <h4 className="font-medium text-gray-800 text-sm mb-1 leading-tight">
                                                            {task.title}
                                                        </h4>

                                                        <p className="text-xs text-gray-500 line-clamp-2">
                                                            {task.description}
                                                        </p>
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