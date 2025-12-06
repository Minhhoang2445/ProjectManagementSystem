import { useAuthStore } from "@/store/useAuthStore";
import { Bell, Search } from "lucide-react";

export default function TopNavbar() {
    const  { user } = useAuthStore()

    return (
        <header className="w-full h-16 bg-white border-b shadow-sm flex items-center px-6 gap-6">
            {/* Left - logo */}
            <div className="flex items-center gap-2">
                <img
                    src="/logo.png"
                    alt="logo"
                    className="w-8 h-8 rounded-full object-cover bg-gray-200"
                />
                <span className="text-lg font-semibold">AProjectO</span>
            </div>

            {/* Middle - search */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:border-blue-500"
                        placeholder="Search for anything..."
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6">
                <Bell className="cursor-pointer" />

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{user?.lastName} {user?.firstName} </span>
                    <img
                        src={`http://localhost:5000${user?.avatar}` || "/defaultAvatar.png"}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                </div>
            </div>
        </header>
    );
}
