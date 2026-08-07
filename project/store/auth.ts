import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setAuth: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken }),
  clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
  isAuthenticated: () => !!get().accessToken,
}));
