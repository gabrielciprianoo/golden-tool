export type ToolState = 'nuevo' | 'en_buen_estado' | 'regular' | 'mal_estado' | 'obsoleto'

export const TOOL_STATES = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'buen estado', label: 'Buen estado' },
  { value: 'regular', label: 'Regular' },
  { value: 'mal estado', label: 'Mal estado' },
  { value: 'obsoleto', label: 'Obsoleto' },
]

export interface ToolInfo {
  id: number
  name: string
  category: string
  price: number
  supplier: string
  entry_date: string
  warranty: string
}

export interface Assignment {
  id: number
  worker_id: string
  tool_id: number
  assigned_quantity: number
  state: ToolState
  date: string
  createdAt: string
  updatedAt: string
  tool?: ToolInfo
}

export interface AssignmentWithTool extends Assignment {
  tool?: ToolInfo
}

export interface AssignmentInput {
  worker_id: number
  tool_id: number
  assigned_quantity: number
  state: ToolState
  date: string 
}

export interface AssignmentUpdateInput {
  assigned_quantity?: number
  state?: ToolState
}
export type WorkerArea = 'montaje/desmontaje' | 'armado/desarmado'

export interface Worker {
  id: string
  worker_code: string
  name: string
  lastname: string
  area: WorkerArea
  createdAt: string
}

export interface CreateWorkerInput {
  name: string
  lastName: string
  area: WorkerArea
}

export const WORKER_AREAS: { value: WorkerArea; label: string }[] = [
  { value: 'montaje/desmontaje', label: 'Montaje / Desmontaje' },
  { value: 'armado/desarmado', label: 'Armado / Desarmado' },
]
