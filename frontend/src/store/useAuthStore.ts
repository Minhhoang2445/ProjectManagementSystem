//các file store chỉ để lưu các state
import { create } from "zustand";
import {toast} from "sonner";
import type { AuthState } from "@/types/store.ts";
import { authService } from "@/services/authService";
export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    isLoading: false,
   
    clearState: () => {
        set({accessToken: null, user: null, isLoading: false});
    },
    signUp: async(firstname, lastname, email, password, department, designation) => {
        try {
            set({isLoading: true});
            //gọi api
            await authService.signUp(firstname, lastname, email, password, department, designation);
            toast.success("Đăng ký thành công");
        } catch (error) {
            console.log(error);
            toast.error("Đăng ký thất bại");
        }
        finally {
            set({isLoading: false});
        }
    },
    signIn: async(email, password) => {
        try {
            set({isLoading: true});
            //gọi api
            const {accessToken} = await authService.signIn(email, password);
            set({accessToken});
            await get().fetchUser();
            toast.success("Đăng nhập thành công");
        } catch (error) {
            console.log(error);
            toast.error("Đăng nhập thất bại");
        }
        finally {
            set({isLoading: false});
        }
    },
    signOut: async() => {
        try {
            //gọi api
            get().clearState();
            await authService.signOut();
            toast.success("Đăng xuất thành công");
        } catch (error) {
            console.log(error);
            toast.error("Đăng xuất thất bại");
        }
        finally {
            set({isLoading: false});
        }
    },    
    fetchUser: async() => {
        try {
            set({isLoading: true});
            //gọi api
            const user = await authService.fetchUser();
            set({user});
            toast.success("Lấy thông tin người dùng thành công");
        } catch (error) {
            console.log(error);
            set({user: null, accessToken:null});
            toast.error("Lấy thông tin người dùng thất bại");
        }
        finally {
            set({isLoading: false});
        }
    },
    refreshToken: async() => {
        try {
            const {user, fetchUser, setAccessToken} = get();
            set({isLoading: true});
            //gọi api
            const accessToken = await authService.refreshToken();
            setAccessToken(accessToken);
            if(!user){
                await fetchUser();
            }
            toast.success("Lấy access token mới thành công");
        } catch (error) {
            console.log(error);
            get().clearState();
        }
        finally {
            set({isLoading: false});
        }
    },
    setAccessToken: (accessToken:string) => {
        set({accessToken});
    },
}))