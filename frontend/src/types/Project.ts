import type {Task} from "./Task.ts";
export interface Project {
    id: number;
    name: string;
    description?: string;
    status: "planned" | "in_progress" | "completed" | "cancelled";
    startDate?: string;
    endDate?: string;
    createdAt: string;

    members?: ProjectMember[];
    tasks?: Task[];
}
export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  roleInProject: "project_leader" | "member";
}
import type { User } from "./User";

export interface UserPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (users: User[]) => void;
}
export interface MemberUI{
  userId: number;
  role: "project_leader" | "member";
  user: User;
}

