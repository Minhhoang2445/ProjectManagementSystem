export default function ProjectMembers({ members }) {
    return (
        <div className="bg-white shadow rounded-xl p-6 border">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>

            <div className="flex items-center gap-4 flex-wrap">
                {members.map((m) => (
                    <div key={m.userId} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500
                            text-white font-semibold flex items-center justify-center shadow">
                            {m.user.firstName[0]}
                        </div>
                        <div>
                            <p className="font-medium">{m.user.firstName} {m.user.lastName}</p>
                            <p className="text-xs text-gray-500">{m.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
