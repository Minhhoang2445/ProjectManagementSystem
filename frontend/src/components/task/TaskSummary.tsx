import { useEffect, useState, useMemo } from "react";
import { useParams, useOutletContext } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/Task";
import type { Project } from "@/types/Project";
import ProjectManageControls from "@/components/project/ProjectManageControls";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CheckCircle2, Clock, TrendingUp, AlertCircle, Users, CalendarDays } from "lucide-react";

interface ProjectOutletContext {
  project: Project;
  user: any;
  role: string | null;
  isLeader: boolean;
  membersSummary: any[];
}

const COLORS = {
  todo: "#cbd5e1",
  in_progress: "#3b82f6",
  review: "#f59e0b",
  done: "#22c55e",
  cancelled: "#ef4444",
};

const formatProjectDate = (value?: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TaskSummary() {
  const { projectId } = useParams();
  const { project, isLeader, user } = useOutletContext<ProjectOutletContext>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<Project>(project);

  useEffect(() => {
    if (projectId) {
      loadTasks(Number(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

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

  const stats = useMemo(() => {
    const myTasks = isLeader
      ? tasks
      : tasks.filter((t) => t.assignee?.id === user?.id);

    const byStatus = {
      todo: myTasks.filter((t) => t.status === "todo").length,
      in_progress: myTasks.filter((t) => t.status === "in_progress").length,
      review: myTasks.filter((t) => t.status === "review").length,
      done: myTasks.filter((t) => t.status === "done").length,
      cancelled: myTasks.filter((t) => t.status === "cancelled").length,
    };

    const byPriority = {
      urgent: myTasks.filter((t) => t.priority === "urgent").length,
      high: myTasks.filter((t) => t.priority === "high").length,
      medium: myTasks.filter((t) => t.priority === "medium").length,
      low: myTasks.filter((t) => t.priority === "low").length,
    };

    const overdue = myTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { total: myTasks.length, byStatus, byPriority, overdue };
  }, [tasks, isLeader, user]);

  const handleProjectUpdated = (updatedProject: Project) => {
    setCurrentProject(updatedProject);
  };

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name.replace("_", " ").toUpperCase(),
    value,
    color: COLORS[name as keyof typeof COLORS],
  }));

  const priorityData = Object.entries(stats.byPriority).map(
    ([name, value]) => ({
      name: name.toUpperCase(),
      value,
    })
  );

  const memberCount = currentProject?.members?.length ?? 0;
  const statusLabel = currentProject?.status?.replace("_", " ") ?? "Unknown";
  const startDateLabel = formatProjectDate(currentProject?.startDate);
  const endDateLabel = formatProjectDate(currentProject?.endDate);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <>
    <div className="px-6 pt-6">
        <h2 className="text-2xl font-bold">
          {isLeader ? "Project Overview" : "My Tasks Overview"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isLeader
            ? "Summary of all project tasks and team performance"
            : "Track your assigned tasks and progress"}
        </p>
      </div>
    <div className="px-6 space-y-6">
      {isLeader && (
        <ProjectManageControls
          project={currentProject}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
      {isLeader && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team members</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberCount}</div>
              <p className="text-xs text-muted-foreground">Active collaborators in this project</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project status</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold capitalize">{statusLabel}</div>
              <p className="text-xs text-muted-foreground">Latest saved state</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule</CardTitle>
              <CalendarDays className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Start</p>
              <p className="text-sm font-semibold">{startDateLabel}</p>
              <p className="mt-2 text-xs text-muted-foreground">End</p>
              <p className="text-sm font-semibold">{endDateLabel}</p>
            </CardContent>
          </Card>
        </div>
      )}
      

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.byStatus.done} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byStatus.in_progress}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.byStatus.review} in review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.todo}</div>
            <p className="text-xs text-muted-foreground">Pending start</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
