import { create } from "zustand";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  // Actions
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  // start as loading=true so the app waits for getProfile on initial load
  loading: true,
  error: null,

  // REGISTER
  register: async (name, email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(
        `${backendUrl}/api/user/register`,
        { name, email, password },
      );
      if (res.data.success) {
        set({ user: res.data.user, loading: false });
      } else {
        set({
          error: res.data.message || "Registration failed",
          loading: false,
        });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Something went wrong",
        loading: false,
      });
    }
  },

  // LOGIN
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(
        `${backendUrl}/api/user/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.success) {
        set({ user: res.data.user, loading: false });
      } else {
        set({ error: res.data.message || "Login failed", loading: false });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Something went wrong",
        loading: false,
      });
    }
  },

  // LOGOUT
  logout: async () => {
    try {
      set({ loading: true, error: null });
      await axios.post(
        `${backendUrl}/api/user/logout`,
        {},
        { withCredentials: true }
      );
      set({ user: null, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Logout failed",
        loading: false,
      });
    }
  },

  // GET PROFILE
  getProfile: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        withCredentials: true,
      });
      if (res.data.success) {
        set({ user: res.data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (err) {
      set({ user: null, loading: false });
    }
  },
}));
