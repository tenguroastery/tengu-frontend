import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AdminState = {
  jwt: string | null;
  email: string | null;
  setSession: (jwt: string, email: string) => void;
  clearSession: () => void;
};

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      jwt: null,
      email: null,
      setSession: (jwt, email) => set({ jwt, email }),
      clearSession: () => set({ jwt: null, email: null }),
    }),
    { name: 'tengu-admin-v1' },
  ),
);
