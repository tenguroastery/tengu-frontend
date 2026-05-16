import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CustomerProfile = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  rut: string | null;
  shipping_address: string | null;
  shipping_comuna: string | null;
  shipping_region: string | null;
  shipping_notes: string | null;
  coffee_prefs: Record<string, unknown> | null;
};

type AuthState = {
  jwt: string | null;
  customer: CustomerProfile | null;
  setSession: (jwt: string) => void;
  setCustomer: (customer: CustomerProfile | null) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      jwt: null,
      customer: null,
      setSession: (jwt) => set({ jwt }),
      setCustomer: (customer) => set({ customer }),
      logout: () => set({ jwt: null, customer: null }),
    }),
    { name: 'tengu-auth-v1' },
  ),
);

export const selectIsAuthed = (state: AuthState) => !!state.jwt;
