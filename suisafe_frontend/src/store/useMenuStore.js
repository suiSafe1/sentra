// src/store/useMenuStore.js
import { create } from "zustand";

export const useMenuStore = create((set) => ({
  menuOpen: false,
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  closeMenu: () => set({ menuOpen: false }),
  openMenu: () => set({ menuOpen: true }),
}));
