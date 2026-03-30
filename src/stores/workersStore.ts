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
  getFilteredWorkers: () => Worker[]
  clearFilters: () => void
}

export const useWorkersStore = create<WorkersState>()(
  (set, get) => ({
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

    getFilteredWorkers: () => {
      const { workers, searchTerm, filterArea } = get()
      const term = searchTerm.toLowerCase().trim()

      return workers.filter((worker) => {
        const matchesSearch =
          !term ||
          worker.name.toLowerCase().includes(term) ||
          worker.lastName.toLowerCase().includes(term) ||
          worker.code.toLowerCase().includes(term)

        const matchesArea = !filterArea || worker.area === filterArea

        return matchesSearch && matchesArea
      })
    },

    fetchWorkers: async () => {
      set({ isLoading: true, error: null })

      const result = await workerService.getAll()

      if (result.success && result.data) {
        set({ workers: result.data, isLoading: false })
      } else {
        const errorMsg =
          'error' in result ? result.error : 'Error al cargar trabajadores'
        set({ error: errorMsg, isLoading: false })
      }
    },

    addWorker: async (data: CreateWorkerInput) => {
      set({ isLoading: true, error: null })

      const result = await workerService.create(data)

      if (result.success && result.data) {
        const workers = get().workers
        set({ workers: [...workers, result.data], isLoading: false })
        return true
      } else {
        const errorMsg =
          'error' in result ? result.error : 'Error al registrar trabajador'
        set({ error: errorMsg, isLoading: false })
        return false
      }
    },

    updateWorker: async (id: string, data: CreateWorkerInput) => {
      set({ isLoading: true, error: null })

      const result = await workerService.update(id, data)

      if (result.success && result.data) {
        const workers = get().workers.map((w) =>
          w.id === id ? result.data! : w
        )
        set({ workers, isLoading: false })
        return true
      } else {
        const errorMsg =
          'error' in result ? result.error : 'Error al actualizar trabajador'
        set({ error: errorMsg, isLoading: false })
        return false
      }
    },

    deleteWorker: async (id: string) => {
      set({ isLoading: true, error: null })

      const result = await workerService.delete(id)

      if (result.success) {
        const workers = get().workers.filter((w) => w.id !== id)
        set({ workers, isLoading: false })
        return true
      } else {
        const errorMsg =
          'error' in result ? result.error : 'Error al eliminar trabajador'
        set({ error: errorMsg, isLoading: false })
        return false
      }
    },
  })
)