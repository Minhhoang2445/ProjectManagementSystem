import { useNavigate } from "react-router";
export function ProjectCard({ project }: { project: any }) {
    const navigate = useNavigate();
    return (
        <div className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => navigate(`/admin/projects/${project.id}`)}
        >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium" style={{ color: project.color }}>
                    {project.name}
                </h2>

                <span
                    className="text-xs px-2 py-1 rounded-md"
                    style={{ backgroundColor: project.color + "20", color: project.color }}
                >
                    {project.status}
                </span>
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-600 mb-4">{project.description}</p>

            {/* PROGRESS BAR */}
            <div>
                <div className="w-full rounded-full bg-gray-200 h-2 mb-1"></div>
                <div
                    className="rounded-full h-2"
                    style={{
                        backgroundColor: project.color,
                        width: `${project.progress}%`,
                        marginTop: "-0.5rem",
                    }}
                ></div>
                <p className="text-xs text-gray-500 mt-2">
                    {project.progress}% completed
                </p>
            </div>
        </div>
    );
}
