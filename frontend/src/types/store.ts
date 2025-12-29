import type { User } from "./User";
import type { Project } from "./Project";
import type { Task } from "./Task"
export  interface AuthState {
    accessToken: string | null;
    user: User | null;
    isLoading: boolean;
    clearState: () => void;
    fetchUser: () => Promise<void>;
    signUp: (firstname: string, lastname: string, email: string, password: string, department: string, designation: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshToken: () => Promise<void>;
    setAccessToken: (accessToken:string) => void;
    setAvatarUser: (avatar: string ) => void;
    
}
export interface projectState {
    projects: Project[];
    selectedProject: Project | null;
    isLoading: boolean;

    fetchProjects: () => Promise<void>;
    fetchProjectById: (id: number) => Promise<void>;
    createProject: (
        name: string,
        description: string ,
        startDate: string ,
        endDate: string ,
        status: Project["status"],
        members: { userId: number; role: string } []
    ) => Promise<void>;
    getUserProjects: (userId: number) => Promise<void>;
}
export interface taskState {
    tasks: Task[];
    selectedTask: Task | null ;
    isLoading: boolean;
    fetchTasks: () => Promise<void>;
    fetchTaskById: (projectId: number, id: number) => Promise<void>;
    getTasksByProjectId: (projectId: number) => Promise<void>;
    getUserTasks: () => Promise<void>;
    createTask: (id: number, data: any) => Promise<void>;
    deleteTask: (projectId: number, taskId: number) => Promise<void>;
    updateTask: (projectId: number, taskId: number, data: any) => Promise<void>;
    uploadTaskAttachments: (projectId: number, taskId: number, files: FileList) => Promise<void>;
}