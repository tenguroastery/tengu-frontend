import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminRole = 'super_admin' | 'admin';

type AdminState = {
  jwt: string | null;
  email: string | null;
  role: AdminRole | null;
  setSession: (jwt: string, email: string, role?: AdminRole) => void;
  setRole: (role: AdminRole) => void;
  clearSession: () => void;
};

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      jwt: null,
      email: null,
      role: null,
      setSession: (jwt, email, role) => set({ jwt, email, role: role ?? null }),
      setRole: (role) => set({ role }),
      clearSession: () => set({ jwt: null, email: null, role: null }),
    }),
    { name: 'tengu-admin-v1' },
  ),
);
