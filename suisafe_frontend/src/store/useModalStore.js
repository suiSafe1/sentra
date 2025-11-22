import { create } from "zustand";

export const useModalStore = create((set) => ({
  isOpen: false,
  view: "main", // 'main' or 'inner'
  modalType: null, // e.g. 'TOP_UP', 'WITHDRAW'
  modalData: null, // card data passed to modal

  // Open modal + optionally set type & data
  openModal: (modalType = null, modalData = null) =>
    set({
      isOpen: true,
      view: "main",
      modalType,
      modalData,
    }),

  // Close modal + reset everything
  closeModal: () =>
    set({
      isOpen: false,
      view: "main",
      modalType: null,
      modalData: null,
    }),

  // Navigation within the modal
  goToInner: () => set({ view: "inner" }),
  goToMain: () => set({ view: "main" }),

  // Toggle modal open/close (without injecting data)
  toggleModal: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      view: state.isOpen ? "main" : state.view,
    })),
}));
