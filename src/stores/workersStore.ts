import { create } from 'zustand'
import type { Worker, CreateWorkerInput, WorkerArea } from '../types/worker'
import { workerService } from '../services/workerService'


const formatWorker = (w: any): Worker => ({
  ...w,
  lastName: w.lastname,
  code: w.worker_code,
})

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

export const useWorkersStore = create<WorkersState>()((set, get) => ({
  workers: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  filterArea: '',

  /*
  |--------------------------------------------------------------------------
  | Utils
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | 🔌 API CALLS
  |--------------------------------------------------------------------------
  */

 fetchWorkers: async () => {
  set({ isLoading: true, error: null })

  const res = await workerService.getAll()

  console.log('DATA:', res.data) // 👈 DEBUG

  if (res.success && res.data) {
    const formattedWorkers = res.data.map((w: any) => ({
      ...w,
      lastName: w.lastname,
      code: w.worker_code,
    }))

    console.log('FORMATTED:', formattedWorkers) // 👈 DEBUG

    set({
      workers: formattedWorkers,
      isLoading: false,
    })
  } else {
    set({ isLoading: false })
  }
},

  addWorker: async (data: CreateWorkerInput) => {
    set({ isLoading: true, error: null })

    const result = await workerService.create(data)

    if (result.success && result.data) {
      const workers = get().workers

      set({
        workers: [...workers, formatWorker(result.data)],
        isLoading: false,
      })

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
        w.id === id ? formatWorker(result.data) : w
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
}))