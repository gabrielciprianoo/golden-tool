export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface IconProps {
  name: string
  size?: number
  className?: string
}

export interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export interface LinkItem {
  href: string
  label: string
  icon?: string
  external?: boolean
}

export interface LinkListProps {
  title: string
  icon?: string
  links: LinkItem[]
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}

export type { SelectProps, SelectOption } from '../components/atoms/Select'
