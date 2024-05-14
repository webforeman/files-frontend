import { create } from 'zustand'

interface ProgressStore {
  uploadProgress: number
  setUploadProgress: (progress: number) => void
  resetUploadProgress: () => void
}

export const useProgressStore = create<ProgressStore>((set) => ({
  uploadProgress: 0,
  setUploadProgress: (progress: number) =>
    set((state) => ({
      uploadProgress: Math.min(Math.max(progress, state.uploadProgress), 100), // Smooth increase
    })),
  resetUploadProgress: () => set({ uploadProgress: 0 }),
}))
