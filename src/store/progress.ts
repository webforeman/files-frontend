import { create } from 'zustand'

interface ProgressStore {
  uploadProgress: number
  setUploadProgress: (progress: number) => void
}

export const useProgressStore = create<ProgressStore>((set) => ({
  uploadProgress: 0,
  setUploadProgress: (progress: number) => set({ uploadProgress: progress }),
}))
