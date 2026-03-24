import type { CardProps } from '../../types'
import clsx from 'clsx'

const variantStyles: Record<string, string> = {
  default: 'bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800',
  elevated: 'bg-surface-50 dark:bg-surface-900 shadow-lg',
  outlined: 'bg-transparent border border-surface-200 dark:border-surface-700',
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
}) => {
  return (
    <div
      className={clsx(
        'card rounded-xl transition-shadow duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
