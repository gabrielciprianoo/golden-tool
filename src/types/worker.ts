export type ToolState = 'nuevo' | 'en_buen_estado' | 'regular' | 'mal_estado' | 'obsoleto'

export const TOOL_STATES: { value: ToolState; label: string }[] = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'en_buen_estado', label: 'En buen estado' },
  { value: 'regular', label: 'Regular' },
  { value: 'mal_estado', label: 'Mal estado' },
  { value: 'obsoleto', label: 'Obsoleto' },
]

export interface Assignment {
  id: number
  id_worker: string
  id_tool: number
  state: ToolState
  date: string
  createdAt: string
  updatedAt: string
}

export interface AssignmentInput {
  id_worker: string
  id_tool: number
  state: ToolState
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
