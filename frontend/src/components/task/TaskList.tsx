import { useEffect, useState, useMemo } from "react";
import { useParams, useOutletContext } from "react-router";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/Task";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Paperclip, AlertCircle } from "lucide-react";

interface ProjectOutletContext {
  project: any;
  user: any;
  role: string | null;
  isLeader: boolean;
  membersSummary: any[];
}

export default function TaskList() {
  const { projectId } = useParams();
  const { isLeader } = useOutletContext<ProjectOutletContext>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadTasks(Number(projectId));
    }
  }, [projectId]);

  const loadTasks = async (id: number) => {
    try {
      const data = await taskService.getTasksByProjectId(id);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchSearch =
        !keyword ||
        task.title?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword);

      if (!matchSearch) return false;

      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }

      if (filterStatus !== "all" && task.status !== filterStatus) {
        return false;
      }

      if (
        filterAssignee !== "all" &&
        String(task.assignee?.id || "") !== filterAssignee
      ) {
        return false;
      }

      return true;
    });
  }, [tasks, search, filterPriority, filterStatus, filterAssignee]);

  const assigneeOptions = useMemo(() => {
    const map = new Map<number, any>();
    tasks.forEach((task) => {
      if (task.assignee) {
        map.set(task.assignee.id, task.assignee);
      }
    });
    return Array.from(map.values());
  }, [tasks]);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < new Date();
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    
    <div className="p-6 space-y-4">
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

      {/* Search + Filter */}
      <div className="flex gap-2 relative">
        <input
          type="text"
          placeholder="Search task..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
        />

        <button
          onClick={() => setIsFilterOpen((prev) => !prev)}
          className="px-3 py-2 border border-gray-300 rounded-sm bg-white text-sm hover:bg-gray-50"
        >
          Filter
        </button>

        {isFilterOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-3 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Assignee
              </label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All assignees</option>
                {assigneeOptions.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  setFilterPriority("all");
                  setFilterStatus("all");
                  setFilterAssignee("all");
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-xs text-blue-600 font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Assignee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsDetailModalOpen(true);
                  }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">
                        {task.title}
                      </span>
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Paperclip size={12} />
                          <span>{task.attachments.length}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      {task.status?.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold uppercase rounded border ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} />
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {task.assignee.firstName?.charAt(0)}
                            {task.assignee.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">
                          {task.assignee.firstName} {task.assignee.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isOverdue(task)
                            ? "text-red-600 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {isOverdue(task) ? (
                          <AlertCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        <span>
                          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No deadline</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-10 text-gray-500">No tasks found</div>
      )}
    </div>
  );
}
