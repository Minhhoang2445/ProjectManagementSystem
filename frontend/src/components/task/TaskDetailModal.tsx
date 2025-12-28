// frontend/src/components/task/TaskDetailModal.tsx
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { Paperclip, Trash2, Save, Download, X } from "lucide-react";
import { toast } from "sonner";
import { useTaskStore } from "../../store/useTaskStore";
import { taskService } from "../../services/taskService"; // Import service
import type { Task } from "../../types/Task";

interface TaskDetailModalProps {
    taskId: number | null;
    projectId: number;
    isOpen: boolean;
    onClose: () => void;
    canEdit?: boolean;
}
interface TaskUpdateForm {
    title: string;
    description: string;
    status: string;
    priority: string;
    assigneeId?: string; // string vì FormData
    dueDate?: string;    // yyyy-MM-dd
}
export const TaskDetailModal = ({ taskId, projectId, isOpen, onClose, canEdit = false }: TaskDetailModalProps) => {
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState<TaskUpdateForm>({
        title: "",
        description: "",
        status: "",
        priority: "",
        assigneeId: "",
        dueDate: "",
    });
    const [newFiles, setNewFiles] = useState<FileList | null>(null);

    const { fetchTasks } = useTaskStore();

    // 1. Fetch Data
    useEffect(() => {
        if (isOpen && taskId) {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    // Gọi qua Service
                    const data = await taskService.getTaskById(projectId,taskId);
                    setTask(data);
                    setFormData({
                        title: data.title,
                        description: data.description || "",
                        status: data.status,
                        priority: data.priority,
                        assigneeId: data.assignee?.id?.toString() || "",
                        dueDate: data.dueDate ? data.dueDate.slice(0, 10) : "",
                    });
                } catch (error) {
                    toast.error("Không thể tải chi tiết công việc");
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }
    }, [isOpen, taskId, projectId]);

    
    // 3. Handle Delete
    const handleDelete = async () => {
        if (!taskId) return;
        if (!confirm("Bạn có chắc muốn xóa công việc này?")) return;
        try {
            // Gọi qua Service
            await taskService.deleteTask(projectId, taskId);

            toast.success("Đã xóa công việc");
            taskService.getTasksByProjectId(projectId);
            onClose();
        } catch (error) {
            toast.error("Không thể xóa (Có thể do phân quyền)");
        }
    };
    const handleUpdate = async () => {
        if (!taskId) return;

        try {
            const formattedDueDate = formData.dueDate
                ? new Date(formData.dueDate).toISOString()
                : undefined;
            const numericAssigneeId = formData.assigneeId && !isNaN(Number(formData.assigneeId))
                ? Number(formData.assigneeId)
                : undefined;

            const basePayload = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: formattedDueDate,
                assigneeId: numericAssigneeId,
            };

            const sanitizedPayload: Record<string, string | number> = Object.fromEntries(
                Object.entries(basePayload)
                    .filter(([, value]) => value !== undefined && value !== null)
                    .map(([key, value]) => [key, value as string | number])
            );

            const hasNewFiles = Boolean(newFiles && newFiles.length);

            if (hasNewFiles && newFiles) {
                const formPayload = new FormData();
                formPayload.append("projectId", String(projectId));

                Object.entries(sanitizedPayload).forEach(([key, value]) => {
                    formPayload.append(key, String(value));
                });

                Array.from(newFiles).forEach((file) => {
                    formPayload.append("files", file);
                });

                await taskService.updateTask(projectId, taskId, formPayload);
            } else {
                await taskService.updateTask(projectId, taskId, sanitizedPayload);
            }

            toast.success("Đã cập nhật công việc");
            
            setIsEditing(false);
            setNewFiles(null);
            onClose();
        } catch (error: any) {
            console.error("Update Error:", error);
            const msg = error?.response?.data?.message || "Không thể cập nhật công việc";
            toast.error(msg);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-8 gap-4">
                        {isEditing ? (
                            <div className="w-full">
                                <Label htmlFor="title" className="mb-1.5 block">Tiêu đề công việc</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="text-lg font-semibold"
                                />
                            </div>
                        ) : (
                            <DialogTitle className="text-xl font-bold leading-tight">
                                {task?.title}
                            </DialogTitle>
                        )}
                    </div>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 flex justify-center text-sm text-muted-foreground">Loading information...</div>
                ) : task ? (
                    <div className="space-y-6">
                        {/* Status & Priority */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase">Status</Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div>
                                        <Badge variant="secondary" className="uppercase tracking-wider font-semibold">
                                            {task.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase">Priority</Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn độ ưu tiên" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                            {task.priority.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Description</Label>
                            {isEditing ? (
                                <Textarea
                                    className="min-h-[120px] resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Thêm mô tả chi tiết cho công việc..."
                                />
                            ) : (
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-md border border-slate-100">
                                    {task.description || <span className="text-muted-foreground italic">No description</span>}
                                </div>
                            )}
                        </div>

                        {/* Attachments */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-sm flex items-center gap-2">
                                <Paperclip className="w-4 h-4" /> Attachments
                            </Label>

                            <div className="grid gap-2">
                                {task.attachments && task.attachments.length > 0 ? (
                                    task.attachments.map((file) => (
                                        <div key={file.id} className="group flex items-center justify-between p-2.5 border rounded-md hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="bg-blue-100 h-8 w-8 flex items-center justify-center rounded text-blue-600 text-[10px] font-bold uppercase shrink-0">
                                                    {file.fileName.split('.').pop()?.slice(0, 3)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium truncate">{file.fileName}</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => window.open(`http://localhost:5000${file.filePath}`, '_blank')}
                                            >
                                                <Download className="w-4 h-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No attachments.</p>
                                )}
                            </div>

                            {isEditing && (
                                <div className="mt-3">
                                    <Input
                                        type="file"
                                        multiple
                                        onChange={(e) => setNewFiles(e.target.files)}
                                        className="cursor-pointer file:text-blue-600 file:font-semibold"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
                                        * Uploading new files will not delete old files.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button  onClick={handleUpdate} 
                                     className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Save className="w-4 h-4 mr-2" /> Save Changes
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {canEdit && (
                                        <Button variant="destructive" onClick={handleDelete} className="mr-auto bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none">
                                            <Trash2 className="w-4 h-4 mr-2" /> Xóa công việc
                                        </Button>
                                    )}
                                    <Button variant="secondary" onClick={onClose}>Đóng</Button>
                                    <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-10 text-center text-muted-foreground">Không tìm thấy dữ liệu</div>
                )}
            </DialogContent>
        </Dialog>
    );
};