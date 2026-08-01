import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: 'unauthenticated',
      isAuthenticated: false,

      setAuth: ({ user, token }) =>
        set({
          user,
          token,
          isAuthenticated: true,
          status: 'authenticated',
        }),

      setUser: (user) => set({ user }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          status: 'unauthenticated',
        }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

export default useAuthStore;
