import { create } from 'zustand'
import type { Worker, CreateWorkerInput, WorkerArea } from '../types/worker'
import { workerService } from '../services/workerService'

interface WorkersState {
  workers: Worker[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  filterArea: WorkerArea | ''

  fetchWorkers: () => Promise<void>
  addWorker: (data: CreateWorkerInput) => Promise<boolean>
  updateWorker: (id: string, data: CreateWorkerInput) => Promise<boolean>
  deleteWorker: (id: string) => Promise<boolean>

  getNextCode: () => string
  setSearchTerm: (term: string) => void
  setFilterArea: (area: WorkerArea | '') => void
  clearFilters: () => void
}

export const useWorkersStore = create<WorkersState>()((set, get) => ({
  workers: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  filterArea: '',

  getNextCode: () => {
    const count = get().workers.length
    const num = count + 1
    return `TRB-${num.toString().padStart(3, '0')}`
  },

  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setFilterArea: (area: WorkerArea | '') => set({ filterArea: area }),
  clearFilters: () => set({ searchTerm: '', filterArea: '' }),

  fetchWorkers: async () => {
    set({ isLoading: true, error: null })

    const res = await workerService.getAll()

    if (res.success && res.data) {
      set({ workers: res.data, isLoading: false })
    } else {
      const errorMsg = 'error' in res ? res.error : 'Error al cargar trabajadores'
      set({ isLoading: false, error: errorMsg })
    }
  },

  addWorker: async (data: CreateWorkerInput) => {
    set({ isLoading: true, error: null })

    const result = await workerService.create(data)

    if (result.success && result.data) {
      set({ workers: [...get().workers, result.data], isLoading: false })
      return true
    } else {
      const errorMsg = 'error' in result ? result.error : 'Error al registrar trabajador'
      set({ error: errorMsg, isLoading: false })
      return false
    }
  },

  updateWorker: async (id: string, data: CreateWorkerInput) => {
    set({ isLoading: true, error: null })

    const result = await workerService.update(id, data)

    if (result.success && result.data) {
      set({
        workers: get().workers.map((w) => (w.id === id ? result.data! : w)),
        isLoading: false,
      })
      return true
    } else {
      const errorMsg = 'error' in result ? result.error : 'Error al actualizar trabajador'
      set({ error: errorMsg, isLoading: false })
      return false
    }
  },

  deleteWorker: async (id: string) => {
    set({ isLoading: true, error: null })

    const result = await workerService.delete(id)

    if (result.success) {
      set({ workers: get().workers.filter((w) => w.id !== id), isLoading: false })
      return true
    } else {
      const errorMsg = 'error' in result ? result.error : 'Error al eliminar trabajador'
      set({ error: errorMsg, isLoading: false })
      return false
    }
  },
}))
