import type { WorkerArea } from '../types/worker'

export const TOOL_STATE_STYLES: Record<string, { label: string; className: string }> = {
  nuevo: { label: 'Nuevo', className: 'bg-blue-100 text-blue-700' },
  'buen estado': { label: 'Buen estado', className: 'bg-emerald-100 text-emerald-700' },
  regular: { label: 'Regular', className: 'bg-yellow-100 text-yellow-700' },
  'mal estado': { label: 'Mal estado', className: 'bg-orange-100 text-orange-700' },
  obsoleto: { label: 'Obsoleto', className: 'bg-gray-100 text-gray-700' },
}

export const getStateLabel = (state: string): string => {
  return TOOL_STATE_STYLES[state]?.label ?? state
}

export const getStateStyle = (state: string): string => {
  return TOOL_STATE_STYLES[state]?.className ?? 'bg-surface-100 text-surface-700'
}

export const formatAreaLabel = (area: WorkerArea | string): string => {
  const labels: Record<string, string> = {
    'montaje/desmontaje': 'Montaje/Desmontaje',
    'armado/desarmado': 'Armado/Desarmado',
  }
  return labels[area] ?? area
}

export const getStockStyle = (quantity: number): { 
  label: string
  className: string
  dotClassName: string
} => {
  if (quantity === 0) {
    return {
      label: 'Sin stock',
      className: 'text-red-600',
      dotClassName: 'bg-red-500',
    }
  }
  return {
    label: `${quantity} disponibles`,
    className: 'text-emerald-600',
    dotClassName: 'bg-emerald-500',
  }
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value)
}

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}