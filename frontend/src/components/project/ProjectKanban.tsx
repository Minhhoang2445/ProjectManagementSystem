import { useOutletContext } from "react-router";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { Project } from "@/types/Project";

type ProjectOutletContext = {
    project: Project;
};

const COLUMNS = ["todo", "in_progress", "review", "done"];

export default function ProjectKanban() {
    const { project } = useOutletContext<ProjectOutletContext>();

    const tasks = project.tasks ?? [];
    const projectId = project.id;

    const grouped: Record<string, any[]> = {
        todo: [],
        in_progress: [],
        review: [],
        done: [],
    };

    tasks.forEach((t) => grouped[t.status].push(t));

    const onDragEnd = () => {
        // handle later
    };

    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-5">
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(grouped).map(([col, items]) => (
                    <Droppable key={col} droppableId={col}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="bg-gray-50 p-4 rounded-xl border shadow-sm"
                            >
                                <h3 className="font-semibold mb-3 capitalize">
                                    {col.replace("_", " ")}
                                </h3>

                                {items.map((task, index) => (
                                    <Draggable
                                        key={task.id}
                                        draggableId={task.id.toString()}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="bg-white p-3 rounded-lg shadow border mb-3"
                                            >
                                                <p className="font-medium">{task.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {task.description}
                                                </p>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}

                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </DragDropContext>
        </div>
    );
}
