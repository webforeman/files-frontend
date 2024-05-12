import { create } from 'zustand'
import { useNotificationStore } from './notify'

interface ErrorStore {
  errors: (Error | unknown)[]
  addError: (error: Error) => void
  removeError: (error: Error) => void
  clearErrors: () => void
}

export const useErrorStore = create<ErrorStore>((set) => ({
  errors: [],
  addError: (error: Error) => {
    const { add } = useNotificationStore.getState()
    add({
      id: `error-${Date.now()}`,
      title: 'Error',
      description: error.message,
      duration: 5000,
      type: 'error',
    })
  },
  removeError: (errorToRemove: Error) =>
    set((state) => ({
      errors: state.errors.filter((error) => error !== errorToRemove),
    })),
  clearErrors: () => set({ errors: [] }),
}))
