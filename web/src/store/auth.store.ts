import { tokenUtils } from "@/lib/api";
import { User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        tokenUtils.set(token);
        set({ user, isAuthenticated: true });
      },
      clearAuth: () => {
        tokenUtils.remove();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "pb-auth",
    },
  ),
);
