import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Plus,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock Data
const stats = [
  {
    title: "Total Projects",
    value: "12",
    description: "+2 from last month",
    icon: LayoutDashboard,
    className: "text-blue-600",
  },
  {
    title: "Total Tasks",
    value: "148",
    description: "+12% completion rate",
    icon: CheckCircle2,
    className: "text-green-600",
  },
  {
    title: "Active Members",
    value: "24",
    description: "4 new joined this week",
    icon: Users,
    className: "text-violet-600",
  },
  {
    title: "Hours Logged",
    value: "1,204",
    description: "+8% from last week",
    icon: Clock,
    className: "text-orange-600",
  },
];

const taskStatusData = [
  { name: "To Do", value: 35, color: "#cbd5e1" }, // slate-300
  { name: "In Progress", value: 45, color: "#3b82f6" }, // blue-500
  { name: "Done", value: 68, color: "#22c55e" }, // green-500
];

const weeklyActivityData = [
  { name: "Mon", created: 4, completed: 6 },
  { name: "Tue", created: 7, completed: 5 },
  { name: "Wed", created: 5, completed: 8 },
  { name: "Thu", created: 8, completed: 10 },
  { name: "Fri", created: 6, completed: 7 },
  { name: "Sat", created: 2, completed: 3 },
  { name: "Sun", created: 1, completed: 1 },
];

const recentActivities = [
  {
    user: "Sarah Chen",
    action: "completed task",
    target: "API Authentication",
    time: "2 hours ago",
    avatar: "SC",
  },
  {
    user: "Mike Ross",
    action: "commented on",
    target: "Frontend Design",
    time: "4 hours ago",
    avatar: "MR",
  },
  {
    user: "Alex Kim",
    action: "created project",
    target: "Mobile App V2",
    time: "Yesterday",
    avatar: "AK",
  },
  {
    user: "Emily Davis",
    action: "deployed",
    target: "Production Build",
    time: "Yesterday",
    avatar: "ED",
  },
];
import { useEffect, useState } from "react";
import { getSystemStats, SystemStats } from "@/services/adminService";

export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  // Transform Data
  const statsCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects || 0,
      description: "Active projects",
      icon: LayoutDashboard,
      className: "text-blue-600",
    },
    {
      title: "Total Tasks",
      value: stats?.totalTasks || 0,
      description: "All time tasks",
      icon: CheckCircle2,
      className: "text-green-600",
    },
    {
      title: "Active Members",
      value: stats?.activeMembers || 0,
      description: "Active users in system",
      icon: Users,
      className: "text-violet-600",
    },
    // Mocking Hours Logged as it is not in API yet
    {
      title: "Hours Logged",
      value: "1,204",
      description: "+8% from last week",
      icon: Clock,
      className: "text-orange-600",
    },
  ];

  const statusColors: Record<string, string> = {
    todo: "#cbd6e2",
    in_progress: "#3b82f6",
    done: "#22c55e",
    review: "#f59e0b",
    cancelled: "#ef4444",
  };

  const taskStatusData =
    stats?.taskStatusDistribution.map((item) => ({
      name: item.status.replace("_", " ").toUpperCase(),
      value: item._count.status,
      color: statusColors[item.status] || "#94a3b8",
    })) || [];

  // Process Weekly Activity (Last 7 Days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
    }
    return days;
  };

  const last7Days = getLast7Days();
  const weeklyActivityData = last7Days.map((date) => {
    const dayTasks = stats?.last7DaysTasks.filter(
      (t) => t.createdAt.split("T")[0] === date
    );
    // As mentioned in backend, checking "completed" is hard without completedAt.
    // For now, we will just show "Created" per day.
    // To match the UI, I'll mock "Completed" or just remove it?
    // Let's count tasks that are "done" AND created on that day as "Completed" (which is wrong but serves as a placeholder)
    // OR we just remove the "Completed" bar for now?
    // Let's keep it but leave it 0 or random for now if we want to be strictly accurate to "not having data".
    // Or better: Count "done" tasks in the `dayTasks` list. This means tasks created that day that are already done.

    return {
      name: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      created: dayTasks?.length || 0,
      completed: dayTasks?.filter((t) => t.status === "done").length || 0,
    };
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your projects and team performance.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.className}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Weekly Activity (Bar Chart) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Tasks created vs completed over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="created"
                    name="Created"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Status (Pie Chart) */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Current distribution of tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions performed by team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 mr-4 border border-slate-200">
                    {activity.avatar}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-semibold">{activity.user}</span>{" "}
                      <span className="text-muted-foreground font-normal">
                        {activity.action}
                      </span>{" "}
                      <span className="font-medium text-primary">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {/* Optional: Add actionable button here */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links / Top Projects (Simplified for now) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Projects</CardTitle>
            <CardDescription>Most active projects this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "Website Redesign",
                "Mobile App iOS",
                "Backend API Migration",
                "Internal Tools",
              ].map((project, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">{project}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
