import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import type { User } from "@/types/User";
import type { UserPickerModalProps } from "@/types/Project";
import { toast } from "sonner";
import { Check, Search } from "lucide-react";

export default function UserPickerModal({ open, onClose, onSelect, excludeUserIds = [] }: UserPickerModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    useEffect(() => {
        if (open) {
            loadUsers();
            setSelectedUsers([]);
        }
    }, [open, excludeUserIds.join(",")]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const payload = await adminService.getAllUsers({ page: 1, limit: 1000 });
            const fetchedUsers = Array.isArray(payload)
                ? payload
                : Array.isArray((payload as any)?.data)
                    ? (payload as any).data
                    : [];
            const excludedSet = new Set(excludeUserIds ?? []);
            setUsers(fetchedUsers.filter((user) => !excludedSet.has(user.id)));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (user: User) => {
        setSelectedUsers((prev) => {
            const exists = prev.find((u) => u.id === user.id);
            if (exists) {
                return prev.filter((u) => u.id !== user.id);
            }
            return [...prev, user];
        });
    };

    const filteredUsers =
        search.trim() === ""
            ? users
            : users.filter((u) =>
                `${u.firstName} ${u.lastName} ${u.email}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white w-[600px] rounded-2xl shadow-2xl p-6 border border-gray-200">

                {/* HEADER */}
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    Select Members
                </h2>

                {/* SEARCH BAR */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-xl w-full pl-10 p-3 text-sm shadow-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
                    />
                </div>

                {/* USER LIST */}
                <div className="max-h-80 overflow-y-auto rounded-xl border bg-gray-50 p-3 custom-scroll">
                    {loading ? (
                        <p className="text-center py-4">Loading...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">No users found.</p>
                    ) : (
                        filteredUsers.map((user) => {
                            const selected = selectedUsers.some((u) => u.id === user.id);

                            return (
                                <div
                                    key={user.id}
                                    onClick={() => toggleSelect(user)}
                                    className={`flex items-center justify-between p-3 mb-2 rounded-xl cursor-pointer transition
                                        ${selected
                                            ? "bg-blue-100 border border-blue-300"
                                            : "hover:bg-gray-100"
                                        }`}
                                >
                                    {/* USER INFO */}
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 
                                            text-white font-semibold flex items-center justify-center shadow">
                                            {user.firstName[0]}
                                        </div>

                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* CHECK ICON */}
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center border 
                                            ${selected
                                                ? "bg-blue-600 border-blue-600"
                                                : "border-gray-300"
                                            }`}
                                    >
                                        {selected && <Check className="text-white" size={16} />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            onSelect(selectedUsers);
                            onClose();
                        }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow hover:opacity-90 transition"
                    >
                        Confirm ({selectedUsers.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
