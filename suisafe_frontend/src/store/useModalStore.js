// src/store/useModalStore.js
// This is a reference implementation - adjust if your store is different

import { create } from "zustand";

export const useModalStore = create((set) => ({
  isOpen: false,
  view: "main", // "main" or "inner"
  modalData: null,

  openModal: (type, data) =>
    set({
      isOpen: true,
      view: "main",
      modalData: data,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      view: "main",
      modalData: null,
    }),

  goToInner: () =>
    set({
      view: "inner",
    }),

  goToMain: () =>
    set({
      view: "main",
    }),
}));
