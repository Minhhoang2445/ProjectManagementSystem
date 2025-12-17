import { ProjectCard } from "./ProjectCard.tsx";
import React from "react";

import type { Project } from "../../types/Project.ts";
import { projectService } from "@/services/projectService.ts";
export function ProjectGrid() {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(true);
    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAll();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load projects:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadProjects();
    }, []);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
            ))}
        </div>
    );
}
