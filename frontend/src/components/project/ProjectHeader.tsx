import React from "react";
import type { Project } from "@/types/Project";
interface Props {
    project: Project;
}

export default function ProjectHeader({ project }: Props) {
    const formatDate = (date?: string) =>
        date ? new Date(date).toLocaleDateString() : "—";

    const progress = 50;

    return (
        <div className="bg-white shadow rounded-xl p-6 border">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>

            <div className="flex items-center gap-6 mt-4">
                <p className="text-sm text-gray-500">
                    Start: <span className="font-medium">{formatDate(project.startDate)}</span>
                </p>
                <p className="text-sm text-gray-500">
                    End: <span className="font-medium">{formatDate(project.endDate)}</span>
                </p>
            </div>

            <div className="mt-5">
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="h-3 rounded-full bg-purple-600 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600 mt-1">{progress}% completed</p>
            </div>
        </div>
    );
}
