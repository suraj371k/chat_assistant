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
  isAuthenticated: boolean;
  initialized: boolean;

  // Actions
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,

  // INITIALIZE - Check auth status on app load
  initialize: async () => {
    if (get().initialized) return;
    
    try {
      set({ loading: true });
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        withCredentials: true,
      });
      if (res.data.success) {
        set({ 
          user: res.data.user, 
          isAuthenticated: true,
          loading: false,
          initialized: true 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false,
          loading: false,
          initialized: true 
        });
      }
    } catch (err) {
      // Silent fail - user just not logged in
      set({ 
        user: null, 
        isAuthenticated: false,
        loading: false,
        initialized: true 
      });
    }
  },

  // REGISTER
  register: async (name, email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(
        `${backendUrl}/api/user/register`,
        { name, email, password },
        { withCredentials: true } // ✅ ADDED THIS
      );
      if (res.data.success) {
        set({ 
          user: res.data.user, 
          isAuthenticated: true, // ✅ ADDED THIS
          loading: false 
        });
        return true; // ✅ Return success
      } else {
        set({
          error: res.data.message || "Registration failed",
          loading: false,
        });
        return false; // ✅ Return failure
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Something went wrong";
      set({
        error: errorMessage,
        loading: false,
      });
      console.error("Register error:", errorMessage); // ✅ Better debugging
      return false;
    }
  },

  // LOGIN
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(
        `${backendUrl}/api/user/login`,
        { email, password },
        { withCredentials: true } // ✅ ADDED THIS - CRITICAL!
      );
      if (res.data.success) {
        set({ 
          user: res.data.user, 
          isAuthenticated: true, // ✅ ADDED THIS
          loading: false 
        });
        return true; // ✅ Return success
      } else {
        set({ 
          error: res.data.message || "Login failed", 
          loading: false 
        });
        return false; // ✅ Return failure
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Something went wrong";
      set({
        error: errorMessage,
        loading: false,
      });
      console.error("Login error:", err.response?.data); // ✅ Better debugging
      return false;
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
      set({ 
        user: null, 
        isAuthenticated: false, // ✅ ADDED THIS
        loading: false 
      });
    } catch (err: any) {
      // Clear local state even if backend fails
      set({
        user: null,
        isAuthenticated: false, // ✅ ADDED THIS
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
        set({ 
          user: res.data.user, 
          isAuthenticated: true, // ✅ ADDED THIS
          loading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, // ✅ ADDED THIS
          loading: false 
        });
      }
    } catch (err) {
      set({ 
        user: null, 
        isAuthenticated: false, // ✅ ADDED THIS
        loading: false 
      });
    }
  },

  // CLEAR ERROR
  clearError: () => set({ error: null }),
}));