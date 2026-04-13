import type { ToolState } from '../../schemas/reviewSchema'

export const TOOL_STATE_OPTIONS: { value: ToolState; label: string }[] = [
  { value: 'buen estado', label: 'Buen estado' },
  { value: 'regular', label: 'Regular' },
  { value: 'mal estado', label: 'Mal estado' },
  { value: 'obsoleto', label: 'Obsoleto' },
]
