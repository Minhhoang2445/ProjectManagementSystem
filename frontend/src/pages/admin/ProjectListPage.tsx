import { useEffect, useMemo, useState } from "react";
import ProjectNavBar from "@/components/project/ProjectNavBar";
import { ProjectFilterBar, type ProjectSortOption } from "@/components/project/ProjectFilterBar";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import type { Project } from "@/types/Project";
import { projectService } from "@/services/projectService";

const parseDateValue = (value?: string | null) => {
    if (!value) return null;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
};

export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | Project["status"]>("all");
    const [sortOrder, setSortOrder] = useState<ProjectSortOption>("recent");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        let active = true;
        const loadProjects = async () => {
            setIsLoading(true);
            try {
                const response = await projectService.getAll();
                if (!active) return;
                setProjects(Array.isArray(response) ? response : []);
                setError(null);
            } catch (err) {
                console.error("Failed to load projects", err);
                if (active) {
                    setError("Không thể tải danh sách dự án. Vui lòng thử lại sau.");
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadProjects();
        return () => {
            active = false;
        };
    }, []);

    const filteredProjects = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        const matchesSearch = (project: Project) => {
            if (!term) return true;
            return [project.name, project.description]
                .filter((value): value is string => Boolean(value))
                .some((value) => value.toLowerCase().includes(term));
        };

        const matchesStatus = (project: Project) => statusFilter === "all" || project.status === statusFilter;

        const sorted = [...projects]
            .filter((project) => matchesSearch(project) && matchesStatus(project))
            .sort((a, b) => {
                switch (sortOrder) {
                    case "alphabetical":
                        return a.name.localeCompare(b.name);
                    case "deadline": {
                        const aTime = parseDateValue(a.endDate) ?? Number.POSITIVE_INFINITY;
                        const bTime = parseDateValue(b.endDate) ?? Number.POSITIVE_INFINITY;
                        return aTime - bTime;
                    }
                    case "recent":
                    default: {
                        const aTime = parseDateValue(a.createdAt) ?? 0;
                        const bTime = parseDateValue(b.createdAt) ?? 0;
                        return bTime - aTime;
                    }
                }
            });

        return sorted;
    }, [projects, searchTerm, statusFilter, sortOrder]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setSortOrder("recent");
    };

    const activeProjects = projects.filter((project) => project.status === "planned" || project.status === "in_progress").length;

    return (
        <div className="w-full space-y-4">
            <ProjectNavBar />

            <div className="m-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
                        <p className="text-sm text-slate-500">{projects.length} total · {activeProjects} active</p>
                    </div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                        Sorted by {sortOrder === "recent" ? "newest" : sortOrder === "alphabetical" ? "name" : "deadline"}
                    </p>
                </div>

                <ProjectFilterBar
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    sortOrder={sortOrder}
                    viewMode={viewMode}
                    onSearchChange={setSearchTerm}
                    onStatusChange={setStatusFilter}
                    onSortChange={setSortOrder}
                    onViewChange={setViewMode}
                    onResetFilters={handleResetFilters}
                    resultCount={filteredProjects.length}
                />

                {error && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                        {error}
                    </div>
                )}

                <ProjectGrid projects={filteredProjects} isLoading={isLoading} viewMode={viewMode} />
            </div>
        </div>
    );
}
