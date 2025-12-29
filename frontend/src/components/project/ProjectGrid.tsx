import { ProjectCard } from "./ProjectCard.tsx";
import type { Project } from "@/types/Project";

type Props = {
    projects: Project[];
    isLoading?: boolean;
    viewMode?: "grid" | "list";
};

export function ProjectGrid({ projects, isLoading = false, viewMode = "grid" }: Props) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60" />
                ))}
            </div>
        );
    }

    if (!projects.length) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500">
                No projects match these filters yet.
            </div>
        );
    }

    const layoutClass =
        viewMode === "grid"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-4";

    return (
        <div className={layoutClass}>
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
}
