import clsx from 'clsx'
import type { InputProps } from '../../types'

export const Input: React.FC<InputProps> = ({ error, className, ...props }) => {
  return (
    <input
      className={clsx(
        'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
        'bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)]',
        'focus:outline-none focus:ring-2',
        error
          ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20'
          : 'border-[var(--input-border)] focus:border-primary-500 focus:ring-primary-500/20',
        className
      )}
      {...props}
    />
  )
}
