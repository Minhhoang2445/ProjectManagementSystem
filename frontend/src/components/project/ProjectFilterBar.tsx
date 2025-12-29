import { Search, SlidersHorizontal, Grid, List, ArrowUpDown } from "lucide-react";
import type { Project } from "@/types/Project";

export type ProjectSortOption = "recent" | "deadline" | "alphabetical";

type Props = {
    searchTerm: string;
    statusFilter: "all" | Project["status"];
    sortOrder: ProjectSortOption;
    viewMode: "grid" | "list";
    onSearchChange: (value: string) => void;
    onStatusChange: (value: "all" | Project["status"]) => void;
    onSortChange: (value: ProjectSortOption) => void;
    onViewChange: (value: "grid" | "list") => void;
    onResetFilters?: () => void;
    resultCount?: number;
};

const STATUS_OPTIONS: Array<{ value: "all" | Project["status"]; label: string }> = [
    { value: "all", label: "Status: All" },
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS: Array<{ value: ProjectSortOption; label: string }> = [
    { value: "recent", label: "Newest first" },
    { value: "alphabetical", label: "Name A → Z" },
    { value: "deadline", label: "Closest deadline" },
];

export function ProjectFilterBar({
    searchTerm,
    statusFilter,
    sortOrder,
    viewMode,
    onSearchChange,
    onStatusChange,
    onSortChange,
    onViewChange,
    onResetFilters,
    resultCount,
}: Props) {
    return (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    type="text"
                    placeholder="Search name or description..."
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => onResetFilters?.()}
                    className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Reset
                </button>

                <select
                    value={statusFilter}
                    onChange={(event) => onStatusChange(event.target.value as "all" | Project["status"])}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    <ArrowUpDown className="h-4 w-4 text-slate-500" />
                    <select
                        value={sortOrder}
                        onChange={(event) => onSortChange(event.target.value as ProjectSortOption)}
                        className="bg-transparent text-sm focus:outline-none"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    <button
                        type="button"
                        onClick={() => onViewChange("grid")}
                        className={`px-3 py-1.5 text-slate-600 transition ${
                            viewMode === "grid"
                                ? "bg-white text-slate-900 shadow"
                                : "hover:bg-white/70"
                        }`}
                        aria-label="Grid view"
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewChange("list")}
                        className={`px-3 py-1.5 text-slate-600 transition ${
                            viewMode === "list"
                                ? "bg-white text-slate-900 shadow"
                                : "hover:bg-white/70"
                        }`}
                        aria-label="List view"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>

                {typeof resultCount === "number" && (
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {resultCount} projects
                    </span>
                )}
            </div>
        </div>
    );
}
