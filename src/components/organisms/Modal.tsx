import { useEffect, useRef } from 'react'
import { IconClose } from '../atoms'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      <div
        ref={modalRef}
        tabIndex={-1}
        className={[
          'relative w-full bg-[var(--bg)] rounded-xl shadow-2xl',
          'border border-[var(--border)]',
          'animate-scale-in',
          sizeClasses[size],
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 id="modal-title" className="text-lg font-semibold text-[var(--text-h)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
            aria-label="Cerrar modal"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-50)] dark:bg-[var(--surface-800)] rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
