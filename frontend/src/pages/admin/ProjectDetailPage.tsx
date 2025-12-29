import { Outlet, useParams } from "react-router";
import { useEffect, useState } from "react";
import { projectService } from "@/services/projectService";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectDetailNavBar from "@/components/project/ProjectDetailNavBar";
import ProjectBreadcrumb from "@/components/project/ProjectBreadcrumb";
import type { Project } from "@/types/Project";
import TaskNavbar from "@/components/task/TaskNavbar";
import { useLocation } from "react-router";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectService.getProjectById(Number(projectId));
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !project) {
    return <p className="p-6">Loading project...</p>;
  }

  return (
    <>
      <div className="w-full border-b border-gray-200 pb-1 bg-white">
        <ProjectBreadcrumb project={project} />
        <ProjectDetailNavBar />
      </div>
      <div className="w-full">
        {location.pathname.includes("/tasks") && <TaskNavbar />}
        <div className="p-6 space-y-6">
          {/* CONTENT */}
          <Outlet context={{ project }} />
        </div>
      </div>
    </>
  );
}
