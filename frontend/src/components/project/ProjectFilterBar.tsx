import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import { useState } from "react";

export function ProjectFilterBar() {
    const [view, setView] = useState("grid"); // grid | list

    return (
        <div className="flex items-center justify-between border rounded-lg px-4 py-3 bg-white mb-4">

            {/* SEARCH */}
            <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search projects..."
                    className="outline-none bg-transparent text-sm w-64"
                />
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                </button>

                <select className="px-3 py-1.5 bg-gray-100 rounded-md text-sm hover:bg-gray-200">
                    <option>Status: All</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                </select>

                {/* VIEW TOGGLE */}
                <div className="flex items-center bg-gray-100 rounded-md overflow-hidden">
                    <button
                        onClick={() => setView("grid")}
                        className={`px-3 py-1.5 ${view === "grid" ? "bg-white shadow" : ""
                            }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`px-3 py-1.5 ${view === "list" ? "bg-white shadow" : ""
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
