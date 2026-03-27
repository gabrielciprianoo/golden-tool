import type { ButtonProps } from '../../types'
import clsx from 'clsx'

const variantStyles: Record<string, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 font-semibold',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 focus:ring-surface-400 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950/20',
  ghost: 'text-surface-600 hover:bg-surface-100 focus:ring-surface-400 dark:text-surface-300 dark:hover:bg-surface-800',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 font-semibold',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'button inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="button__spinner inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current" />
      ) : (
        <>
          {leftIcon && <span className="button__icon">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="button__icon">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
