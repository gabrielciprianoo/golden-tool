import { useToastStore, type Toast, type ToastType } from '../../stores/toastStore'

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
    icon: (
      <svg className="w-5 h-5 text-success-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
    icon: (
      <svg className="w-5 h-5 text-danger-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
    icon: (
      <svg className="w-5 h-5 text-warning-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
    icon: (
      <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[400] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast: Toast) => {
        const style = toastStyles[toast.type]
        return (
          <div
            key={toast.id}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
              'animate-slide-in-right',
              style.bg,
            ].join(' ')}
          >
            {style.icon}
            <p className="text-sm text-[var(--text-h)] flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-black/5 transition-colors"
            >
              <svg className="w-4 h-4 text-[var(--text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
