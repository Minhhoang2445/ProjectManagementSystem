import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import { useState } from "react";

export function ProjectFilterBar() {
    const [view, setView] = useState("grid");

    return (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-64 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </button>

                <select className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <option>Status: All</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                </select>

                <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <button
                        onClick={() => setView("grid")}
                        className={`px-3 py-1.5 text-slate-600 transition dark:text-slate-200 ${
                            view === "grid"
                                ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                                : "hover:bg-white/70 dark:hover:bg-slate-700"
                        }`}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`px-3 py-1.5 text-slate-600 transition dark:text-slate-200 ${
                            view === "list"
                                ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                                : "hover:bg-white/70 dark:hover:bg-slate-700"
                        }`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
