import ProjectNavBar from "@/components/project/ProjectNavBar";
export default function ProjectPage() {
    return (
        <div className="space-y-4  w-full  ">
            <ProjectNavBar />
            <div className="border rounded-lg bg-card shadow-sm h-full overflow-y-auto m-4 p-4">
                <p>Welcome to the Project Management Page. Select a project to view details.</p>
            </div>
        </div>
    );
}