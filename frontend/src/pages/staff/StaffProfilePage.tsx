import { Mail, User, Building, BadgeCheck, Briefcase } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useRef } from "react"
import { userService } from "@/services/userService"

export default function StaffProfilePage() {
    const user = useAuthStore((s) => s.user)
    const setAvatarUser = useAuthStore((s) => s.setAvatarUser)

    const fileRef = useRef<HTMLInputElement>(null)

    const handleClickAvatar = () => {
        fileRef.current?.click()
    }

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const result = await userService.uploadAvatar(file)

        setAvatarUser(result.user.avatar)   // lấy avatar đúng từ user
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10 p-6">

            {/* Header */}
            <div className="flex items-center gap-6 px-6 py-6 bg-white shadow rounded-xl">

                {/* avatar */}
                <div
                    className="relative cursor-pointer group"
                    onClick={handleClickAvatar}
                >
                    <img
                        src={`http://localhost:5000${user?.avatar}` || "/defaultAvatar.png"}
                        className="w-24 h-24 rounded-full border shadow-sm object-cover"
                    />

                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-xs duration-200">
                        Click to change
                    </div>
                </div>

                {/* input ẩn */}
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

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                        <BadgeCheck size={16} />
                        verified Staff
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow border">

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
    )
}
