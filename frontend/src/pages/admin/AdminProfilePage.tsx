import { Mail, User, Building, BadgeCheck, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRef } from "react";
import { userService } from "@/services/userService";

export default function AdminProfilePage() {
    const user = useAuthStore((s) => s.user);
    const setAvatarUser = useAuthStore((s) => s.setAvatarUser);

    const fileRef = useRef<HTMLInputElement>(null);

    const handleClickAvatar = () => {
        fileRef.current?.click();
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const result = await userService.uploadAvatar(file);
        setAvatarUser(result.user.avatar);
    };

    const avatarSrc = user?.avatar
        ? user.avatar.startsWith("http")
            ? user.avatar
            : `http://localhost:5000${user.avatar}`
        : "/defaultAvatar.png";

    return (
        <div className="mx-auto max-w-3xl space-y-10 p-6">
            <div className="flex items-center gap-6 rounded-xl bg-white px-6 py-6 shadow">
                <div
                    className="group relative cursor-pointer"
                    onClick={handleClickAvatar}
                >
                    <img
                        src={avatarSrc}
                        className="h-24 w-24 rounded-full border object-cover shadow-sm"
                        alt="Admin Avatar"
                    />

                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-xs text-white opacity-0 duration-200 group-hover:opacity-100">
                        Click to change
                    </div>
                </div>

                <input
                    type="file"
                    hidden
                    ref={fileRef}
                    accept="image/*"
                    onChange={handleFile}
                />

                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold">
                        {user?.lastName} {user?.firstName}
                    </h1>

                    <div className="flex items-center gap-3 text-gray-500">
                        <Mail size={18} />
                        <span>{user?.email}</span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                        <BadgeCheck size={16} />
                        verified Admin
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 rounded-xl border bg-white p-6 shadow">
                <div className="space-y-1">
                    <span className="text-xs uppercase text-gray-400">Department</span>
                    <div className="flex items-center gap-2 text-gray-800">
                        <Building size={18} />
                        {user?.department}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-xs uppercase text-gray-400">Designation</span>
                    <div className="flex items-center gap-2 text-gray-800">
                        <Briefcase size={18} />
                        {user?.designation}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-xs uppercase text-gray-400">Role</span>
                    <div className="flex items-center gap-2 text-gray-800">
                        <User size={18} />
                        {user?.role}
                    </div>
                </div>
            </div>
        </div>
    );
}
