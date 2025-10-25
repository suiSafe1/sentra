import { create } from "zustand";

export const useModalStore = create((set) => ({
  isOpen: false,
  view: "main", // 'main' or 'inner'
  openModal: () => set({ isOpen: true, view: "main" }),
  closeModal: () => set({ isOpen: false, view: "main" }),
  goToInner: () => set({ view: "inner" }),
  goToMain: () => set({ view: "main" }),
  toggleModal: () => set((state) => ({ isOpen: !state.isOpen })),
}));
