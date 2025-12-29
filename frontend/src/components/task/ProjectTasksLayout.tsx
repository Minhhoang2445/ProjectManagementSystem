import { Outlet, useOutletContext } from "react-router";
import { useEffect, useMemo } from "react";
import TaskNavbar from "@/components/task/TaskNavbar";
import { useAuthStore } from "@/store/useAuthStore";
import type { Project } from "@/types/Project";
import type { User } from "@/types/User";

interface ProjectOutletContext {
	project: Project;
}

interface TaskOutletContext {
	project: Project;
	user: User | null;
	role: string | null;
	isLeader: boolean;
	membersSummary: Array<{ userId: number; firstName: string; lastName: string }>;
}

export default function ProjectTasksLayout() {
	const { project } = useOutletContext<ProjectOutletContext>();
	const { user, fetchUser } = useAuthStore();

	useEffect(() => {
		if (!user) {
			fetchUser();
		}
	}, [user, fetchUser]);

	const taskContext = useMemo<TaskOutletContext>(() => {
		if (!project) {
			return {
				project,
				user: user ?? null,
				role: null,
				isLeader: false,
				membersSummary: [],
			};
		}

		const membersSummary = (project.members ?? []).map((member: any) => ({
			userId: member.userId,
			firstName: member.user?.firstName ?? "Unknown",
			lastName: member.user?.lastName ?? "",
		}));

		const memberMatch = project.members?.find((m: any) => m.userId === user?.id);
		const roleInProject = user?.role === "admin"
			? "admin"
			: memberMatch?.roleInProject ?? null;

		return {
			project,
			user: user ?? null,
			role: roleInProject,
			isLeader: roleInProject === "project_leader" || user?.role === "admin",
			membersSummary,
		};
	}, [project, user]);

	return (
		<div className="w-full">
			<TaskNavbar />
			<div className="w-full space-y-4">
				<Outlet context={taskContext} />
			</div>
		</div>
	);
}
