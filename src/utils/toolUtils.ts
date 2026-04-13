import type { WorkerArea } from '../types/worker'

export const TOOL_STATE_STYLES: Record<string, { label: string; className: string }> = {
  nuevo:         { label: 'Nuevo',       className: 'bg-blue-500    text-white' },
  'buen estado': { label: 'Buen estado', className: 'bg-emerald-500 text-white' },
  regular:       { label: 'Regular',     className: 'bg-amber-600   text-white' },
  'mal estado':  { label: 'Mal estado',  className: 'bg-orange-500  text-white' },
  obsoleto:      { label: 'Obsoleto',    className: 'bg-slate-500   text-white' },
  perdida:       { label: 'Perdida',     className: 'bg-red-500     text-white' },
}

export const getStateLabel = (state: string): string => {
  return TOOL_STATE_STYLES[state]?.label ?? state
}

export const getStateStyle = (state: string): string => {
  return TOOL_STATE_STYLES[state]?.className ?? 'bg-slate-100 text-slate-600'
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