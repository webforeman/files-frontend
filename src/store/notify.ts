import { create } from 'zustand'

export interface Toast {
  id: string
  title: string
  description?: string
  duration?: number
  action?: React.ReactNode
  controllerId?: string
  timeoutId?: NodeJS.Timeout
  type?: 'error' | 'info' | 'success'
}
export interface NotificationState {
  notifications: Record<string, Toast[]>
  add: (toast: Toast) => void
  remove: (toast: Toast) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: {},
  add: (toast) => {
    set((state) => {
      const controllerId = toast.controllerId ?? 'notifications'
      const currentToasts = state.notifications[controllerId] || []
      const newToasts = currentToasts.concat(toast)
      if (toast.duration) {
        const timeoutId = setTimeout(() => {
          set((state) => {
            const existingToasts = state.notifications[controllerId] || []
            return {
              notifications: {
                ...state.notifications,
                [controllerId]: existingToasts.filter((t) => t.id !== toast.id),
              },
            }
          })
        }, toast.duration)
        // Save ID timer in notify object
        toast.timeoutId = timeoutId
      }
      return {
        notifications: {
          ...state.notifications,
          [controllerId]: newToasts,
        },
      }
    })
  },
  remove: (toast) => {
    set((state) => {
      const controllerId = toast.controllerId ?? 'notifications'
      const filteredToasts = state.notifications[controllerId].filter((t) => {
        if (t.id === toast.id && t.timeoutId) {
          clearTimeout(t.timeoutId) // Clear timer if the notification is removed before the time
        }
        return t.id !== toast.id
      })
      return {
        notifications: {
          ...state.notifications,
          [controllerId]: filteredToasts,
        },
      }
    })
  },
}))
