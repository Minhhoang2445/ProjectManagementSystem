import api from "../lib/axios";

export const authService = {
    signUp: async (firstName: string, lastName: string, email: string, password: string, department: string, designation: string) => {
        const res = await api.post("/auth/signup", {
            firstName,
            lastName,
            email,
            password,
            department,
            designation
        },
        {
            withCredentials: true,
        }
    );
        return res.data;
    },
    signIn: async (email: string, password: string) => {
        const res = await api.post("/auth/signin", {
            email,
            password,
        },
        {
            withCredentials: true,
        }
    );
        return res.data;
    },
    signOut: async () => {
    return api.post("/auth/signout", { withCredentials: true });
  },

  fetchUser: async () => {
    const res = await api.get("/user/me", {
      withCredentials: true,
    });
    return res.data.user;
  },

  refreshToken: async () => {
    const res = await api.post("/auth/refresh", { withCredentials: true });
    return res.data.accessToken;
  },
}
