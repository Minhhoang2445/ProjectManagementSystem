import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { User } from "../../types/User";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/auth/dropdown-menu";
import { Button } from "@/components/auth/button";
import {
  Check,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";

/* ================= COMPONENT ================= */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===== SORT ===== */
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  /* ===== FILTER (áp dụng thật) ===== */
  const [filters, setFilters] = useState<{
    status?: string;
    department?: string;
  }>({});

  /* ===== FILTER (nháp trong UI) ===== */
  const [draftFilters, setDraftFilters] = useState<{
    status?: string;
    department?: string;
  }>({});

  /* ===== PAGINATION ===== */
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  /* ================= HELPERS ================= */

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 border-green-300";
      case "pending":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "suspended":
        return "text-red-600 bg-red-100 border-red-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  /* ================= API ================= */

  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await adminService.getAllUsers({
        sort: sortBy,
        order,
        status: filters.status,
        department: filters.department,
        page,
        limit,
      });

      setUsers(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [sortBy, order, filters, page]);

  /* ================= HANDLERS ================= */

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  /* ================= UI ================= */

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Users Management</h1>

      {/* ===== FILTER BAR ===== */}
      <div className="flex justify-end items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Filter size={16} />
              Filter
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 p-4 space-y-4">
            <DropdownMenuLabel>Filter Users</DropdownMenuLabel>

            {/* STATUS */}
            <div>
              <label className="text-xs font-medium">Status</label>
              <select
                className="w-full mt-1 border rounded px-2 py-1 text-sm"
                value={draftFilters.status ?? ""}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    status: e.target.value || undefined,
                  }))
                }
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* DEPARTMENT */}
            <div>
              <label className="text-xs font-medium">Department</label>
              <select
                className="w-full mt-1 border rounded px-2 py-1 text-sm"
                value={draftFilters.department ?? ""}
                onChange={(e) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    department: e.target.value || undefined,
                  }))
                }
              >
                <option value="">All</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraftFilters({});
                  setFilters({});
                  setPage(1);
                }}
              >
                Clear
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setFilters(draftFilters);
                  setPage(1);
                }}
              >
                Apply
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        
      </div>

      {/* ===== TABLE ===== */}
      <div className="border rounded-lg bg-card shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr className="text-left text-sm text-foreground/70">
              <th
                className="p-3 border-b cursor-pointer"
                onClick={() => handleSort("firstName")}
              >
                Name{" "}
                {sortBy === "firstName" &&
                  (order === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </th>
              <th
                className="p-3 border-b cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortBy === "email" &&
                  (order === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </th>
              <th className="p-3 border-b">Department</th>
              <th className="p-3 border-b">Designation</th>
              <th
                className="p-3 border-b cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Role{" "}
                {sortBy === "role" &&
                  (order === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </th>
              <th
                className="p-3 border-b cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortBy === "status" &&
                  (order === "asc" ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  ))}
              </th>
              <th className="p-3 border-b w-20 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-5 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-5 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="text-sm hover:bg-muted/40 transition-colors"
                >
                  <td className="p-3 border-b">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-3 border-b">{user.email}</td>
                  <td className="p-3 border-b">{user.department}</td>
                  <td className="p-3 border-b">{user.designation}</td>
                  <td className="p-3 border-b capitalize">{user.role}</td>
                  <td className="p-3 border-b">
                    <span
                      className={`capitalize px-2 py-1 rounded-md text-xs font-medium border ${statusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 border-b text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-40">
                        <DropdownMenuLabel>
                          Update Status
                        </DropdownMenuLabel>

                        {["active", "pending", "suspended"].map(
                          (statusOption) => (
                            <DropdownMenuItem
                              key={statusOption}
                              className="capitalize flex justify-between"
                              onClick={async () => {
                                try {
                                  await adminService.updateUserStatus(
                                    user.id,
                                    statusOption
                                  );
                                  toast.success(
                                    `User set to ${statusOption}`
                                  );
                                  loadUsers();
                                } catch (err) {
                                  toast.error("Failed to update");
                                  console.error(err);
                                }
                              }}
                            >
                              {statusOption}
                              {user.status === statusOption && (
                                <Check size={16} />
                              )}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION ===== */}
      <div className="flex justify-end items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>

        <span className="text-sm">
          Page {page} / {totalPages || 1}
        </span>

        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
