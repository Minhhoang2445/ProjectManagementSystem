import { Link, useLocation, useParams } from "react-router";
import type { Project } from "@/types/Project";

interface Props {
    project: Project;
}

export default function ProjectBreadcrumb({ project }: Props) {
    const location = useLocation();
    const { projectId } = useParams();

    const segments = location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const labelMap: Record<string, string> = {
        overview: "Overview",
        tasks: "Tasks",
        members: "Members",
        settings: "Settings",
    };

    return (
        <nav className="text-sm text-gray-500 flex items-center gap-2  pt-3 px-9">
            <Link to="/admin/projects/list" className="hover:text-gray-800">
                Projects
            </Link>
            <span>/</span>
            <Link to={`/admin/projects/${projectId}`} className="hover:text-gray-800">
                {project.name}
            </Link>

            {labelMap[lastSegment] && (
                <>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">
                        {labelMap[lastSegment]}
                    </span>
                </>
            )}
        </nav>
    );
}
