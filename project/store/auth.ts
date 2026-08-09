import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  clubId?: string | null;
  clubName?: string | null;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  /*
    False until the persisted session has been read back out of localStorage.

    On a fresh page load the store starts empty and is filled a tick later, so
    anything that redirects on "no token" has to wait for this — otherwise a
    signed-in user who refreshes or opens a bookmarked dashboard is bounced to
    the login page before their session has been read. It is deliberately not
    persisted: it describes this page load, not the session.
  */
  hydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      isAuthenticated: () => !!get().accessToken,
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'knscl-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      /*
        Runs once rehydration finishes, including when nothing was stored —
        an absent session is still a settled answer.

        It flips the flag through the state handed to the callback rather than
        through `useAuthStore`: localStorage is synchronous, so this fires
        while `create()` is still running and the exported binding does not
        exist yet. Reaching for it here leaves the flag false forever and every
        dashboard stuck on "Checking your session…".
      */
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

/*
  The single answer to "may I decide about this user yet?", kept here rather
  than repeated in each guard so there is one definition of readiness.

  Reads only store state, which makes it safe on the server too: during
  prerender it is false, exactly as it is on the client's first paint, so the
  two agree and there is no hydration mismatch. Once the callback above sets
  the flag it stays set, so a component mounting later sees it immediately.
*/
export function useAuthReady(): boolean {
  return useAuthStore((s) => s.hydrated);
}
