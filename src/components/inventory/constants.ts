import type { ToolCategory, ToolStatus } from '../../types/inventory'

export const categoryOptions: { value: ToolCategory; label: string }[] = [
  { value: 'normal', label: 'Herramienta Normal' },
  { value: 'refaccion', label: 'Refacción' },
]

export const statusOptions: { value: ToolStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]
