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
