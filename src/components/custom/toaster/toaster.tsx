import { useNotificationStore } from '@/store/notify'
import { Cross1Icon } from '@radix-ui/react-icons'
import {
  Action,
  Close,
  Description,
  Provider,
  Root,
  Title,
  Viewport,
} from '@radix-ui/react-toast'
import { Toast } from '@/store/notify'
import styles from './toaster.module.css'
import { cn } from '@/lib/utils'

interface ToastControllerProps {
  id: string
}

interface ToastProps {
  toast: Toast
  onClose: () => void
  zIndex: number
}

export function ToastController({ id }: ToastControllerProps) {
  const toasts = useNotificationStore((state) => state.notifications[id] || [])
  const remove = useNotificationStore((state) => state.remove)

  return (
    <Provider>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          zIndex={index}
          onClose={() => remove(toast)}
          toast={toast}
        />
      ))}
      <Viewport className={styles.ToastViewport} />
    </Provider>
  )
}

function Toast({ toast, onClose, zIndex }: ToastProps) {
  const toastClass =
    toast.type === 'error'
      ? cn(styles.ToastError, styles.ToastRoot)
      : styles.ToastRoot // Conditional class depending on type

  return (
    <Root
      className={toastClass}
      duration={toast.duration ?? 5000}
      style={{ zIndex }}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Title className={styles.ToastTitle}>{toast.title}</Title>
      {toast.description && (
        <Description className={styles.ToastDescription}>
          {toast.description}
        </Description>
      )}
      {toast.action ? (
        <Action altText="a" asChild className={styles.ToastAction}>
          {toast.action}
        </Action>
      ) : (
        <Close asChild>
          <button
            className={styles.ToastAction}
            type="button"
            aria-label="Close"
          >
            <Cross1Icon />
          </button>
        </Close>
      )}
    </Root>
  )
}
