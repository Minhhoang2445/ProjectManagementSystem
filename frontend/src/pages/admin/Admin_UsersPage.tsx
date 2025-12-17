import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService.ts";
import type { User } from "../../types/User";
// import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/auth/dropdown-menu.tsx";
import { Button } from "@/components/auth/button";
import { Check, MoreHorizontal } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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

  // fetch user list
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();

      // đảm bảo data là array
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Users Management</h1>

      <div className="border rounded-lg bg-card shadow-sm h-full overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr className="text-left text-sm text-foreground/70">
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Department</th>
              <th className="p-3 border-b">Designation</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b w-20">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-5 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-5 text-center text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="text-sm hover:bg-muted/40 transition-colors"
                >

                  {/* FULL NAME */}
                  <td className="p-3 border-b">
                    {user.firstName} {user.lastName}
                  </td>

                  {/* EMAIL */}
                  <td className="p-3 border-b">{user.email}</td>

                  {/* DEPARTMENT */}
                  <td className="p-3 border-b">{user.department}</td>

                  {/* DESIGNATION */}
                  <td className="p-3 border-b">{user.designation}</td>

                  {/* ROLE */}
                  <td className="p-3 border-b capitalize">{user.role}</td>

                  {/* STATUS */}
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
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>

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
                                  toast.success(`User set to ${statusOption}`);
                                  loadUsers();
                                } catch (err) {
                                  toast.error("Failed to update");
                                  console.log(err);
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
    </div>
  );
}
