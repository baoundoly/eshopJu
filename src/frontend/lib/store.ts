import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartDto } from './types';

interface CartStore {
  cart: CartDto | null;
  setCart: (cart: CartDto | null) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: null,
      setCart: (cart) => set({ cart }),
      clearCart: () => set({ cart: null }),
    }),
    { name: 'eshopju-cart' },
  ),
);

interface AuthUser {
  name: string;
  email: string;
  role: 'admin' | 'customer';
  token: string;
}

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      setUser: (user) => set({ user, isAdmin: user?.role === 'admin' }),
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        set({ user: null, isAdmin: false });
      },
    }),
    { name: 'eshopju-auth' },
  ),
);
