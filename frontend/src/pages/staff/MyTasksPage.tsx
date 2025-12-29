import { Outlet, useParams } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { projectService } from "@/services/projectService";
import { useAuthStore } from "@/store/useAuthStore"; // Import store
import type { User } from "@/types/User";
import type { Project } from "@/types/Project";
import TaskNavbar from "@/components/task/TaskNavbar";
export default function MyTasksPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  // 1. Lấy user trực tiếp từ Store thông qua Hook
  // Khi fetchUser chạy xong và cập nhật store, biến 'user' ở đây sẽ tự có dữ liệu và component tự re-render
  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    if (projectId) {
      loadProject();
    }

    // 2. Chỉ fetch user nếu trong store chưa có (tránh gọi API thừa nếu đã login rồi)
    if (!user) {
      fetchUser();
    }
  }, [projectId, user, fetchUser]); // Thêm dependencies an toàn

  const loadProject = async () => {
    try {
      const data = await projectService.getProjectById(Number(projectId));
      setProject(data);
    } catch (error) {
      console.error("Failed to load project", error);
    }
  };

  const { role, isLeader } = useMemo(() => {
    if (!user) return { role: null, isLeader: false };

    // 🛡 ADMIN hệ thống → toàn quyền
    if (user.role === "admin") {
      return {
        role: "admin",
        isLeader: true,
      };
    }

    if (!project) return { role: null, isLeader: false };

    const member = project.members?.find(
      (m: any) => m.userId === user.id
    );

    const roleInProject = member ? member.roleInProject : null;

    return {
      role: roleInProject,
      isLeader: roleInProject === "project_leader",
    };
  }, [project, user]);

  const membersSummary = useMemo(() => {
    if (!project?.members) return [];
    return project.members.map((m: any) => ({
      userId: m.userId,
      firstName: m.user?.firstName || "Unknown",
      lastName: m.user?.lastName || "User",
    }));
  }, [project]);
  return (
    <>
    <div className="w-full  ">
      <TaskNavbar />
    </div>
    <div className="w-full space-y-4">
      
      <Outlet context={{ project, user, role, isLeader, membersSummary }} />
    </div>
    </>
  );
}