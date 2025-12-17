import ProjectNavBar from "@/components/project/ProjectNavBar";
import { ProjectFilterBar } from "@/components/project/ProjectFilterBar";
import { ProjectGrid } from "@/components/project/ProjectGrid";

export default function ProjectPage() {
    return (
        <div className="w-full space-y-4">
            <ProjectNavBar />

            {/* Main Content */}
            <div className="m-4 p-4 border rounded-xl bg-card shadow-sm">
                {/* PAGE HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Projects</h1>
                   
                </div>

                {/* FILTER BAR */}
                <ProjectFilterBar />

                {/* PROJECT LIST */}
                <ProjectGrid />
            </div>
        </div>
    );
}
