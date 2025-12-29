import ProjectNavBar from "@/components/project/ProjectNavBar";
import { ProjectFilterBar } from "@/components/project/ProjectFilterBar";
import { ProjectGrid } from "@/components/project/ProjectGrid";

export default function ProjectPage() {
    return (
        <div className="w-full space-y-4">
            <ProjectNavBar />

            {/* Main Content */}
            <div className="m-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
                {/* PAGE HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Projects</h1>
                   
                </div>

                {/* FILTER BAR */}
                <ProjectFilterBar />

                {/* PROJECT LIST */}
                <ProjectGrid />
            </div>
        </div>
    );
}
