import { useOutletContext } from "react-router";
import type { Project } from "@/types/Project";
import ProjectHeader from "./ProjectHeader";

type OutletContext = {
    project: Project;
};

export default function ProjectOverview() {
    const { project } = useOutletContext<OutletContext>();

    return (
        <div className="bg-white shadow rounded-xl p-6 border">
            <ProjectHeader project={project} />
        </div>
    );
}
