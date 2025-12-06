import type { User } from "./User";
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