import ProjectNavBar from "@/components/project/ProjectNavBar";
import ProjectPortfolioOverview from "@/components/project/ProjectPortfolioOverview";

export default function ProjectPage() {
    return (
        <div className="w-full space-y-4">
            <ProjectNavBar />
            <ProjectPortfolioOverview />
        </div>
    );
}